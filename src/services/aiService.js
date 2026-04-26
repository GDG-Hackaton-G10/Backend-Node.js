import Groq from "groq-sdk";
import Medicine from "../models/Medicine.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a medical prescription parser. Extract all medicines from the given OCR text.
Return ONLY a valid JSON array with no extra text, markdown, or explanation.
Each item must have:
- name (string, required): medicine name
- dosage (string): e.g. "500mg", "10mg"
- frequency (string): e.g. "twice daily", "every 8 hours"
- confidence (number): between 0 and 1

Example output:
[{"name":"Amoxicillin","dosage":"500mg","frequency":"3 times daily","confidence":0.95}]

If no medicines found, return an empty array: []`;


export const extractWithAI = async (ocrText) => {
    const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Extract medicines from this prescription text:\n\n${ocrText}` }
        ],
        temperature: 0.1,
        max_tokens: 1000,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty response from AI");

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("AI response is not an array");

    return parsed;
};

const DOSAGE_PATTERN = /\b\d+(\.\d+)?\s*(mg|mcg|ml|g|iu|units?)\b/gi;
const FREQUENCY_PATTERNS = [
    /\b(once|twice|three times?)\s*(a\s*)?(daily|day|per day)\b/gi,
    /\b(every\s*\d+\s*(hours?|hrs?))\b/gi,
    /\b(\d+\s*times?\s*(a\s*)?(day|daily|per day))\b/gi,
    /\b(morning|evening|night|bedtime|with meals?|after meals?|before meals?)\b/gi,
    /\b(OD|BD|TDS|QID|PRN|SOS)\b/g,
];
const MEDICINE_INDICATORS = [
    /\b(tab\.?|tablet|cap\.?|capsule|syrup|injection|inj\.?|drops?|cream|ointment|gel|inhaler)\b/gi,
];

const cleanText = (text) => text.replace(/[^\w\s.]/g, ' ').replace(/\s+/g, ' ').trim();

const extractDosage = (line) => {
    const match = line.match(DOSAGE_PATTERN);
    return match ? match[0] : null;
};

const extractFrequency = (line) => {
    for (const pattern of FREQUENCY_PATTERNS) {
        const match = line.match(pattern);
        if (match) return match[0];
    }
    return null;
};

export const extractWithRegex = (ocrText) => {
    const lines = ocrText.split('\n').map(cleanText).filter(l => l.length > 2);
    const medicines = [];

    for (const line of lines) {
        const hasMedicineIndicator = MEDICINE_INDICATORS.some(p => p.test(line));
        if (!hasMedicineIndicator && !extractDosage(line)) continue;

        const words = line.split(' ');
        const name = words.slice(0, 2).join(' ').replace(/tab\.?|cap\.?/gi, '').trim();
        if (name.length < 3) continue;

        medicines.push({
            name,
            dosage: extractDosage(line),
            frequency: extractFrequency(line),
            confidence: 0.5,
        });
    }

    return medicines;
};



export const matchMedicines = async (extractedMedicines) => {
    const matched = await Promise.all(
        extractedMedicines.map(async (item) => {
            try {
                const result = await Medicine.findOne(
                    { $text: { $search: item.name } },
                    { score: { $meta: "textScore" } }
                ).sort({ score: { $meta: "textScore" } });

                return {
                    ...item,
                    matchedMedicine: result ? result._id : undefined,
                };
            } catch {
                return { ...item, matchedMedicine: undefined };
            }
        })
    );
    return matched;
};