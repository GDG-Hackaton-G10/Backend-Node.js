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

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;