import { TryCatch } from "../middlewares/tryCatch.js";
import Address from "../models/Address.js";

export const addAdd = TryCatch(async (req, res) => {
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { mobile, formattedAddress, latitude, longitude } = req.body;

    if (!mobile || !formattedAddress || latitude === null || longitude === null) return res.status(400).json({ message: 'All fields are required' });

    const address = await Address.create({
        userId: user.id,
        mobile,
        formattedAddress,
        location: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
        },
    });

    res.status(200).json({
        message: 'Address added successfully',
        address,
    });
});

export const deleteAdd = TryCatch(async (req, res) => {
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;

    if (!id) res.status(400).json({ message: 'id is required' });

    const address = await Address.findOneAndDelete({ _id: id, userId: user.id });

    if (!address) return res.status(404).json({ message: 'Address not found' });

    res.status(200).json({
        message: 'Address deleted successfully',
        address,
    });
});

export const fetchAdd = TryCatch(async (req, res) => {
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const address = await Address.find({ userId: user.id }).sort({ createdAt: -1 });

    res.status(200).json({
        message: 'Address fetched successfully',
        address
    });
});