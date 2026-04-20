import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Medicine from '../src/models/Medicine.js';
import Pharmacy from '../src/models/Pharmacy.js';

dotenv.config();

const genericMedicines = [
    { name: 'Amoxicillin', genericName: 'Amoxicillin', dosage: '500 mg', category: 'Antibiotic', aliases: ['Amoxil'] },
    { name: 'Paracetamol', genericName: 'Paracetamol', dosage: '500 mg', category: 'Analgesic', aliases: ['Acetaminophen', 'Panadol'] },
    { name: 'Metformin', genericName: 'Metformin', dosage: '500 mg', category: 'Antidiabetic', aliases: ['Glucophage'] },
    { name: 'Atorvastatin', genericName: 'Atorvastatin', dosage: '10 mg', category: 'Statins', aliases: ['Lipitor'] },
    { name: 'Salbutamol', genericName: 'Salbutamol', dosage: '100 mcg', category: 'Bronchodilator', aliases: ['Albuterol', 'Ventolin'] },
    { name: 'Omeprazole', genericName: 'Omeprazole', dosage: '20 mg', category: 'Antacid', aliases: ['Prilosec'] }
];

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

        const createdMeds = await Medicine.insertMany(genericMedicines);
        console.log(`${createdMeds.length} Generic Medicines Created`);

        const pharmacyData = addisPharmacies.map((pharmacy) => {
            const inventory = createdMeds.map((medicine) => ({
                medicine: medicine.id,
                inStock: Math.random() > 0.15,
                quantity: 50 + Math.floor(Math.random() * 100)
            }));
            return { ...pharmacy, medicines: inventory };
        });
        await Pharmacy.insertMany(pharmacyData);
        console.log(`All Pharmacies Seeded with common Stock`);

        process.exit(0);
    }catch(error){
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();