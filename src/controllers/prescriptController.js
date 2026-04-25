import Prescription from "../models/Prescription.js";
import { extractWithAI, extractWithRegex, matchMedicines } from "../services/aiService.js";
import AppError from "../utils/appError.js";


export const extractMedicines = async (req, res, next) => {
    try {
        const { prescriptionId, ocrText } = req.body;

        if (!prescriptionId || !ocrText) {
            return next(new AppError("prescriptionId and ocrText are required", 400));
        }

        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return next(new AppError("Prescription not found", 404));
        }

        if (prescription.userId.toString() !== req.user._id.toString()) {
            return next(new AppError("Not authorized to access this prescription", 403));
        }

        
        prescription.ocrText = ocrText;

   
        let extractedMedicines = [];
        let extractionMethod = "ai";

        try {
            console.log("Attempting AI extraction...");
            extractedMedicines = await extractWithAI(ocrText);
            console.log(`AI extracted ${extractedMedicines.length} medicines`);
        } catch (aiError) {
            console.error("AI failed, using regex fallback:", aiError.message);
            extractedMedicines = extractWithRegex(ocrText);
            extractionMethod = "regex";
            console.log(`Regex extracted ${extractedMedicines.length} medicines`);
        }

    
        const matchedMedicines = await matchMedicines(extractedMedicines);

       
        prescription.medicines = matchedMedicines;
        prescription.status = "processed";
        await prescription.save();

        res.status(200).json({
            success: true,
            data: {
                prescriptionId: prescription._id,
                extractionMethod,
                medicines: matchedMedicines,
                count: matchedMedicines.length,
            },
        });

    } catch (err) {
        console.error("extractMedicines error:", err.message);
        next(new AppError("Extraction failed. Please try again.", 500));
    }
};