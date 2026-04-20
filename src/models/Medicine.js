import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3, 
        maxlength: 100,
        trim: true,
    },
    genericName: {
        type: String,
        minlength: 3,
        maxlength: 100,
        trim: true,
    },
    dosage: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    category: {
        type: String,
        minlength: 3,
        maxlength: 100,
        trim: true,
    },
    aliases: [{
        type: String,
        trim: true,
    }]
}, {
    timestamps: true
});

medicineSchema.index({
    name: 'text',
    genericName: 'text',
    aliases: 'text'
});

medicineSchema.index({ name: 1 });
medicineSchema.index({ genericName: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;