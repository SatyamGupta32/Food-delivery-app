import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mobile:{
        type: String,
        required: true,
    },
    formattedAddress: {
        type: String,
        required: true,
    },
    location:{
        type:{
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point', 
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    }
},{
    timestamps: true,
}
);

AddressSchema.index({ location: '2dsphere' });

export default mongoose.model('Address', AddressSchema);