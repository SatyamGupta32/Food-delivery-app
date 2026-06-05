import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    // price: {
    //     type: Number,
    //     required: true,
    // },
}, {
    timestamps: true,
});

CartSchema.index({ userId: 1, restaurantId: 1, itemId: 1}, { unique: true })

export default mongoose.model('Cart', CartSchema);