import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true,
    },
    medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine", 
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    price: { 
        type: Number, 
        required: true,
        min: 0,
    }
},
{
    timestamps: true
});

inventorySchema.index({ pharmacy: 1, medicine: 1}, { unique: true});

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;