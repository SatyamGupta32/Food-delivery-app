import mongoose, { Schema } from 'mongoose';

const riderSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    adhaar: {
        type: String,
        required: true,
        match: /^[2-9]{1}[0-9]{11}$/,
        unique: true
    },
    drivingLicense: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        },
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    lastActiveAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

riderSchema.index({ "location": "2dsphere" });

export default mongoose.model('Rider', riderSchema);