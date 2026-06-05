import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    restaurantName: {
        type: String,
        required: true,
    },
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    riderPhone: {
        type: Number,
        default: null,
    },
    riderName: {
        type: String,
        default: null,
    },
    distance: {
        type: String,
        required: true,
    },
    riderAmount: {
        type: Number, 
    },
    items: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    }],
    subTotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        required: true,
    },
    platformFee: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
    deliveryAddress: {
        formattedAddress: {
            type: String,
            required: true,
        },
        mobile: {
            type: Number,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        }
    },
    status: {
        type: String,
        enum: [
            'placed',
            'accepted',
            'preparing',
            'ready_for_rider',
            'rider_assigned',
            'picked_up',
            'delivered',
            'cancelled',
        ],
        default: 'placed',
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'stripe'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },
    expireAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

OrderSchema.index({ "deliveryAddress.location": "2dsphere" });
OrderSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Order', OrderSchema);



// paymentId: {
//     type: String,
//     default: null,
// },