import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import Medicine from '../src/models/Medicine.js';
import Pharmacy from '../src/models/Pharmacy.js';
import PharmacyMedicine from '../src/models/PharmacyMedicine.js';
import MedicineRequest from '../src/models/MedicineRequest.js';

dotenv.config();

const medicineGroups = {
    Antibiotic: [
        ['Amoxicillin', '500 mg', ['Amoxil']],
        ['Azithromycin', '250 mg', ['Zithromax']],
        ['Ciprofloxacin', '500 mg', ['Cipro']],
        ['Pyrimethamine', '25 mg', ['Daraprim']],
        ['Cephalexin', '500 mg', ['Keflex']],
        ['Clindamycin', '300 mg', ['Dalacin C']],
        ['Metronidazole', '400 mg', ['Flagyl']],
        ['Trimethoprim', '200 mg', ['Proloprim']],
        ['Sulfamethoxazole', '800 mg', ['Bactrim']],
        ['Nitrofurantoin', '100 mg', ['Macrobid']],
        ['Cefuroxime', '500 mg', ['Zinacef']],
        ['Cefixime', '200 mg', ['Suprax']],
        ['Amoxicillin-Clavulanate', '625 mg', ['Augmentin']],
        ['Roxithromycin', '150 mg', ['Rulid']],
        ['Erythromycin', '250 mg', ['E-Mycin']],
        ['Levofloxacin', '500 mg', ['Levaquin']],
        ['Moxifloxacin', '400 mg', ['Avelox']],
        ['Tinidazole', '500 mg', ['Fasigyn']],
        ['Fusidic Acid', '250 mg', ['Fucidin']],
        ['Linezolid', '600 mg', ['Zyvox']],
    ],
    Analgesic: [
        ['Paracetamol', '500 mg', ['Acetaminophen', 'Panadol']],
        ['Ibuprofen', '400 mg', ['Advil', 'Brufen']],
        ['Diclofenac', '50 mg', ['Voltaren']],
        ['Naproxen', '250 mg', ['Aleve']],
        ['Aspirin', '81 mg', ['Acetylsalicylic Acid']],
        ['Tramadol', '50 mg', ['Ultram']],
        ['Ketorolac', '10 mg', ['Toradol']],
        ['Meloxicam', '7.5 mg', ['Mobic']],
        ['Piroxicam', '20 mg', ['Feldene']],
        ['Celecoxib', '200 mg', ['Celebrex']],
        ['Indomethacin', '25 mg', ['Indocin']],
        ['Dexibuprofen', '300 mg', ['Seractil']],
        ['Acetaminophen-Codeine', '325 mg', ['Tylenol #3']],
        ['Mefenamic Acid', '500 mg', ['Ponstan']],
        ['Etoricoxib', '90 mg', ['Arcoxia']],
        ['Codeine', '30 mg', ['Codeinum']],
        ['Ketoprofen', '100 mg', ['Oruvail']],
        ['Nimesulide', '100 mg', ['Nimulid']],
        ['Hydrocodone', '5 mg', ['Vicodin']],
        ['Morphine', '10 mg', ['MS Contin']],
    ],
    Antidiabetic: [
        ['Metformin', '500 mg', ['Glucophage']],
        ['Glibenclamide', '5 mg', ['Glyburide']],
        ['Gliclazide', '80 mg', ['Diamicron']],
        ['Glimepiride', '2 mg', ['Amaryl']],
        ['Pioglitazone', '30 mg', ['Actos']],
        ['Sitagliptin', '100 mg', ['Januvia']],
        ['Linagliptin', '5 mg', ['Tradjenta']],
        ['Vildagliptin', '50 mg', ['Galvus']],
        ['Empagliflozin', '10 mg', ['Jardiance']],
        ['Dapagliflozin', '10 mg', ['Farxiga']],
        ['Insulin Glargine', '100 IU/ml', ['Lantus']],
        ['Insulin Lispro', '100 IU/ml', ['Humalog']],
        ['Insulin Aspart', '100 IU/ml', ['NovoRapid']],
        ['Acarbose', '50 mg', ['Glucobay']],
        ['Repaglinide', '1 mg', ['Prandin']],
        ['Dulaglutide', '0.75 mg', ['Trulicity']],
        ['Semaglutide', '1 mg', ['Ozempic']],
        ['Canagliflozin', '100 mg', ['Invokana']],
        ['Saxagliptin', '5 mg', ['Onglyza']],
        ['Exenatide', '5 mcg', ['Byetta']],
    ],
    Cardiovascular: [
        ['Atorvastatin', '10 mg', ['Lipitor']],
        ['Rosuvastatin', '10 mg', ['Crestor']],
        ['Simvastatin', '20 mg', ['Zocor']],
        ['Amlodipine', '5 mg', ['Norvasc']],
        ['Lisinopril', '10 mg', ['Prinivil']],
        ['Losartan', '50 mg', ['Cozaar']],
        ['Hydrochlorothiazide', '25 mg', ['Microzide']],
        ['Furosemide', '40 mg', ['Lasix']],
        ['Carvedilol', '12.5 mg', ['Coreg']],
        ['Atenolol', '50 mg', ['Tenormin']],
        ['Bisoprolol', '5 mg', ['Concor']],
        ['Propranolol', '40 mg', ['Inderal']],
        ['Enalapril', '10 mg', ['Vasotec']],
        ['Valsartan', '80 mg', ['Diovan']],
        ['Nifedipine', '20 mg', ['Adalat']],
        ['Clopidogrel', '75 mg', ['Plavix']],
        ['Warfarin', '5 mg', ['Coumadin']],
        ['Aspirin + Clopidogrel', '75 mg', ['Dual Antiplatelet']],
        ['Spironolactone', '25 mg', ['Aldactone']],
        ['Diltiazem', '60 mg', ['Cardizem']],
    ],
    Respiratory: [
        ['Salbutamol', '100 mcg', ['Albuterol', 'Ventolin']],
        ['Budesonide', '200 mcg', ['Pulmicort']],
        ['Formoterol', '12 mcg', ['Foradil']],
        ['Salmeterol', '50 mcg', ['Serevent']],
        ['Ipratropium', '20 mcg', ['Atrovent']],
        ['Montelukast', '10 mg', ['Singulair']],
        ['Cetirizine', '10 mg', ['Zyrtec']],
        ['Loratadine', '10 mg', ['Claritin']],
        ['Fexofenadine', '120 mg', ['Allegra']],
        ['Theophylline', '200 mg', ['Theo-24']],
        ['Fluticasone', '50 mcg', ['Flixotide']],
        ['Tiotropium', '18 mcg', ['Spiriva']],
        ['Prednisolone', '5 mg', ['Prelone']],
        ['Dexamethasone', '4 mg', ['Decadron']],
        ['Oxygen Inhalation', 'Medical Gas', ['O2']],
        ['Ambroxol', '30 mg', ['Mucosolvan']],
        ['Guaifenesin', '200 mg', ['Robitussin']],
        ['Bromhexine', '8 mg', ['Bisolvon']],
        ['Epinephrine Inhalation', '1 mg/ml', ['Adrenaline']],
        ['Leukotriene Modifier', '10 mg', ['Accolate']],
    ],
    Gastrointestinal: [
        ['Omeprazole', '20 mg', ['Prilosec']],
        ['Pantoprazole', '40 mg', ['Protonix']],
        ['Esomeprazole', '40 mg', ['Nexium']],
        ['Ranitidine', '150 mg', ['Zantac']],
        ['Famotidine', '20 mg', ['Pepcid']],
        ['Metoclopramide', '10 mg', ['Reglan']],
        ['Ondansetron', '4 mg', ['Zofran']],
        ['Domperidone', '10 mg', ['Motilium']],
        ['Loperamide', '2 mg', ['Imodium']],
        ['Lactulose', '10 g/15 ml', ['Duphalac']],
        ['Senna', '8.6 mg', ['Senokot']],
        ['Bisacodyl', '5 mg', ['Dulcolax']],
        ['Magnesium Hydroxide', '400 mg', ['Milk of Magnesia']],
        ['Sucralfate', '1 g', ['Carafate']],
        ['Bismuth Subsalicylate', '262 mg', ['Pepto-Bismol']],
        ['Cimetidine', '200 mg', ['Tagamet']],
        ['Dicyclomine', '20 mg', ['Bentyl']],
        ['Hyoscine Butylbromide', '10 mg', ['Buscopan']],
        ['ORS Sachet', 'Oral Rehydration', ['Oralyte']],
        ['Simethicone', '80 mg', ['Gas-X']],
    ],
    NeurologyPsych: [
        ['Sertraline', '50 mg', ['Zoloft']],
        ['Fluoxetine', '20 mg', ['Prozac']],
        ['Amitriptyline', '25 mg', ['Elavil']],
        ['Diazepam', '5 mg', ['Valium']],
        ['Lorazepam', '1 mg', ['Ativan']],
        ['Clonazepam', '0.5 mg', ['Klonopin']],
        ['Carbamazepine', '200 mg', ['Tegretol']],
        ['Valproic Acid', '500 mg', ['Depakene']],
        ['Levetiracetam', '500 mg', ['Keppra']],
        ['Phenytoin', '100 mg', ['Dilantin']],
        ['Gabapentin', '300 mg', ['Neurontin']],
        ['Pregabalin', '75 mg', ['Lyrica']],
        ['Risperidone', '2 mg', ['Risperdal']],
        ['Olanzapine', '5 mg', ['Zyprexa']],
        ['Haloperidol', '5 mg', ['Haldol']],
        ['Quetiapine', '25 mg', ['Seroquel']],
        ['Mirtazapine', '15 mg', ['Remeron']],
        ['Bupropion', '150 mg', ['Wellbutrin']],
        ['Escitalopram', '10 mg', ['Lexapro']],
        ['Topiramate', '100 mg', ['Topamax']],
    ],
    VitaminsMinerals: [
        ['Vitamin C', '500 mg', ['Ascorbic Acid']],
        ['Vitamin D3', '1000 IU', ['Cholecalciferol']],
        ['Vitamin B12', '1000 mcg', ['Cyanocobalamin']],
        ['Vitamin B6', '50 mg', ['Pyridoxine']],
        ['Folic Acid', '5 mg', ['Folate']],
        ['Iron Sulfate', '325 mg', ['FeSO4']],
        ['Calcium Carbonate', '500 mg', ['Caltrate']],
        ['Magnesium Sulfate', '250 mg', ['Epsom Salt']],
        ['Zinc Sulfate', '20 mg', ['ZnSO4']],
        ['Multivitamin', 'Tablet', ['MVI']],
        ['Vitamin A', '5000 IU', ['Retinol']],
        ['Vitamin E', '400 IU', ['Tocopherol']],
        ['Selenium', '100 mcg', ['Selenite']],
        ['Omega-3', '1000 mg', ['Fish Oil']],
        ['Biotin', '5 mg', ['Vitamin H']],
        ['Niacin', '50 mg', ['Vitamin B3']],
        ['Thiamine', '100 mg', ['Vitamin B1']],
        ['Riboflavin', '100 mg', ['Vitamin B2']],
        ['Potassium Chloride', '600 mg', ['KCl']],
        ['Magnesium Citrate', '200 mg', ['Citrate of Magnesia']],
    ],
    AntifungalAntiviral: [
        ['Fluconazole', '150 mg', ['Diflucan']],
        ['Itraconazole', '100 mg', ['Sporanox']],
        ['Ketoconazole', '200 mg', ['Nizoral']],
        ['Terbinafine', '250 mg', ['Lamisil']],
        ['Nystatin', '500000 IU', ['Mycostatin']],
        ['Acyclovir', '400 mg', ['Zovirax']],
        ['Valacyclovir', '500 mg', ['Valtrex']],
        ['Oseltamivir', '75 mg', ['Tamiflu']],
        ['Zidovudine', '300 mg', ['Retrovir']],
        ['Lamivudine', '300 mg', ['Epivir']],
        ['Tenofovir', '300 mg', ['Viread']],
        ['Efavirenz', '600 mg', ['Sustiva']],
        ['Nevirapine', '200 mg', ['Viramune']],
        ['Ribavirin', '200 mg', ['Copegus']],
        ['Remdesivir', '100 mg', ['Veklury']],
        ['Penciclovir', '1%', ['Denavir']],
        ['Famciclovir', '250 mg', ['Famvir']],
        ['Ganciclovir', '500 mg', ['Cytovene']],
        ['Ciclopirox', '8%', ['Loprox']],
        ['Miconazole', '2%', ['Monistat']],
    ],
    Antimalarial: [
        ['Artemether-Lumefantrine', '20/120 mg', ['Coartem']],
        ['Chloroquine', '250 mg', ['Aralen']],
        ['Quinine', '300 mg', ['Qualaquin']],
        ['Primaquine', '15 mg', ['Primaquine']],
        ['Sulfadoxine-Pyrimethamine', '500/25 mg', ['Fansidar']],
        ['Mefloquine', '250 mg', ['Lariam']],
        ['Dihydroartemisinin-Piperaquine', '40/320 mg', ['Eurartesim']],
        ['Atovaquone-Proguanil', '250/100 mg', ['Malarone']],
        ['Artesunate', '50 mg', ['Arsumax']],
        ['Artemether', '80 mg', ['Paluther']],
        ['Hydroxychloroquine', '200 mg', ['Plaquenil']],
        ['Proguanil', '100 mg', ['Paludrine']],
        ['Doxycycline', '100 mg', ['Vibramycin']],
        ['Halofantrine', '250 mg', ['Halfan']],
        ['Lumefantrine', '120 mg', ['Coartem']],
        ['Chlorproguanil', '80 mg', ['Lapdap']],
        ['Artesunate-Amodiaquine', '100/270 mg', ['ASAQ']],
        ['Pyronaridine', '180 mg', ['Pyramax']],
        ['Secnidazole', '2 g', ['Secnil']],
        ['Tafenoquine', '150 mg', ['Krintafel']],
    ],
};

const dosageFallbacks = {
    Antibiotic: '500 mg',
    Analgesic: '500 mg',
    Antidiabetic: '500 mg',
    Cardiovascular: '10 mg',
    Respiratory: '100 mcg',
    Gastrointestinal: '20 mg',
    NeurologyPsych: '50 mg',
    VitaminsMinerals: '1 tablet',
    AntifungalAntiviral: '200 mg',
    Antimalarial: '250 mg',
};

const genericMedicines = Object.entries(medicineGroups).flatMap(([category, medicines]) => (
    medicines.map(([name, dosage, aliases]) => ({
        name,
        genericName: name,
        dosage: dosage || dosageFallbacks[category] || '500 mg',
        category,
        aliases,
    }))
));

const addisPharmacies = [
    {
        name: 'Gishen Pharmacy (22 Branch)',
        address: '22 Branch, Addis Ababa',
        openingHours: '08:00 - 22:00',
        location: { type: 'Point', coordinates: [38.7745, 9.0105] },
        contactInfo: { phoneNumber: '0911760000', email: 'gishen@example.com' }
    },
    {
        name: 'Kenema Pharmacy (4 Kilo)',
        address: '4 Kilo, Addis Ababa',
        openingHours: '09:00 - 21:00',
        location: { type: 'Point', coordinates: [38.7635, 9.0330] },
        contactInfo: { phoneNumber: '0111234567', email: 'kenema@example.com' }
    },
    {
        name: 'Belema Pharmacy (Bole)',
        address: 'Bole, Addis Ababa',
        openingHours: '07:30 - 23:00',
        location: { type: 'Point', coordinates: [38.7885, 8.9890] },
        contactInfo: { phoneNumber: '0941295757', email: 'belema@example.com' }
    }
];

const seedData = async () => {
    try{
        await connectDB();
        await Medicine.deleteMany();
        await Pharmacy.deleteMany();
        await PharmacyMedicine.deleteMany();
        await MedicineRequest.deleteMany();

        const createdMeds = await Medicine.insertMany(genericMedicines);
        console.log(`${createdMeds.length} Medicines Created`);

        const pharmacyUsers = [
            { name: 'Gishen Owner', email: 'gishen.owner@example.com', password: 'password123' },
            { name: 'Kenema Owner', email: 'kenema.owner@example.com', password: 'password123' },
            { name: 'Belema Owner', email: 'belema.owner@example.com', password: 'password123' },
        ];

        const User = (await import('../src/models/User.js')).default;
        await User.deleteMany({ email: { $in: pharmacyUsers.map((user) => user.email) } });

        const createdUsers = await User.insertMany(
            await Promise.all(
                pharmacyUsers.map(async (user) => ({
                    ...user,
                    password: await bcrypt.hash(user.password, 10),
                    role: 'pharmacy',
                }))
            )
        );

        const pharmacies = await Pharmacy.insertMany(addisPharmacies.map((pharmacy, index) => ({
            ...pharmacy,
            ownerId: createdUsers[index]._id,
            status: 'approved',
        })));

        const pharmacyInventory = [];
        pharmacies.forEach((pharmacy, index) => {
            createdMeds.forEach((medicine) => {
                pharmacyInventory.push({
                    pharmacyId: pharmacy._id,
                    medicineId: medicine._id,
                    price: 100 + (index * 20) + Math.floor(Math.random() * 50),
                    stock: 50 + Math.floor(Math.random() * 100),
                    availability: Math.random() > 0.15,
                });
            });
        });

        await PharmacyMedicine.insertMany(pharmacyInventory);
        console.log(`All Pharmacies Seeded with common Stock`);

        process.exit(0);
    }catch(error){
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();