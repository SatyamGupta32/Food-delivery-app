import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: null
    },
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);