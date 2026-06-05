import mongoose, { Schema } from 'mongoose';

const RestaurantSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    image: {
        type: String,
        required: true,
    },
    ownerId: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    autoLocation:{
        type:{
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        formattedAddress: {
            type: String,
            required: true,
        }
    },
    isOpen:{
        type: Boolean,
        default: false,
        required: true
    },
    lastActiveAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true
});

RestaurantSchema.index({ autoLocation: '2dsphere' });

export default mongoose.model('Restaurant', RestaurantSchema);
