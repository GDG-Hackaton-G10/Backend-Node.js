import { configDotenv } from "dotenv";
import connectDB from "../src/config/db.js"
import Medicine from '../src/models/Medicine.js';
import Pharmacy from '../src/models/Pharmacy.js';

const genericMedicines = [
    { name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'Antibiotic' },
    { name: 'Paracetamol', genericName: 'Paracetamol', category: 'Analgesic' },
    { name: 'Metformin', genericName: 'Metformin', category: 'Antidiabetic' },
    { name: 'Atorvastatin', genericName: 'Atorvastatin', category: 'Statins' },
    { name: 'Salbutamol', genericName: 'Salbutamol', category: 'Bronchodilator' },
    { name: 'Omeprazole', genericName: 'Omeprazole', category: 'Antacid' }
];

const addisPharmacies = [
    {
        name: 'Gishen Pharmacy (22 Branch)',
        location: { type: 'Point', coordinates: [38.7745, 9.0105] },
        phoneNumber: '0911760000'
    },
    {
        name: 'Kenema Pharmacy (4 Kilo)',
        location: { type: 'Point', coordinates: [38.7635, 9.0330] },
        phoneNumber: '0111234567'
    },
    {
        name: 'Belema Pharmacy (Bole)',
        location: { type: 'Point', coordinates: [38.7885, 8.9890] },
        phoneNumber: '0941295757'
    }
];

const seedData = async () => {
    try{
        await connectDB();
        await Medicine.deleteMany();
        await Pharmacy.deleteMany();

        const createdMeds = await Medicine.insertMany(genericMedicines);
        console.log(`{createdMeds.length} Generic Medicines Created`);

        const pharmacyData = addisPharmacies.map((pharmacy) => {
            const inventory = createdMeds.map((medicine) => ({
                medicine: medicine.id,
                inStock: true,
                quantity: 100
            }));
            return {...pharmacy, medicines: inventory};
        });
        await Pharmacy.insertMany(pharmacyData);
        console.log(`All Pharmacies Seeded with common Stock`);

        process.exit(0);
    }catch(Error){
        console.error(`Seeding Failed:`,err);
        process.exit(1);
    }
}