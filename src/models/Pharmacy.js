import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    openingHours: {
        type: String,
        trim: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function(coords) {
                    return Array.isArray(coords) && coords.length === 2;
                },
                message: 'Coordinates must be [longitude, latitude]'
            }
        }
    },
    medicines: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
            required: true
        },
        inStock: {
            type: Boolean,
            default: false
        },
        quantity: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    contactInfo: {
        phoneNumber: {
            type: String,
            required: true
        },
        email: String,
        socialMediaAddresses: [String]
    }
},{
    timestamps: true
});

pharmacySchema.index({ location: '2dsphere'});
pharmacySchema.index({ 'medicines.medicine': 1 });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;