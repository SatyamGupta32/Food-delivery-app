import axios from 'axios';
import { AUTH_SERVICE, INTERNAL_SERVICE_KEY, RESTAURANT_SERVICE, UTILS_SERVICE } from '../config/env.js';
import { TryCatch } from '../middlewares/tryCatch.js';
import getBuffer from '../config/dataUri.js';
import Rider from '../models/Rider.js';

export const riderProfile = TryCatch(async (req, res) => {

    const user = req.user;

    if (!user) return res.status(401).json({ message: 'unauthorized' });

    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Image is required' });

    const fileBuffer = getBuffer(file);

    if (!fileBuffer) return res.status(400).json({ message: 'Failed to generate buffer image' });

    const { data } = await axios.post(
        `${UTILS_SERVICE}/api/utils/upload`,
        {
            buffer: fileBuffer.content,
        },
    );

    const { phone, adhaar, drivingLicense, latitude, longitude } = req.body;

    if (!phone || !adhaar || !drivingLicense || isNaN(latitude) || isNaN(longitude))
        return res.status(400).json({ message: 'All fields required to fill' });

    const exsistProfile = await Rider.findOne({ userId: user.id });

    if (exsistProfile) return res.status(400).json({ message: 'Profile already exist' });

    const riderProfile = await Rider.create({
        userId: user.id,
        picture: data.url,
        phone,
        adhaar,
        drivingLicense,
        location: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
        },
        isAvailable: false,
        isVerified: false,
    });

    res.status(200).json({ message: 'Rider profile created successfully', riderProfile });
});

export const fetchRiderProfile = TryCatch(async (req, res) => {
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const account = await Rider.findOne({ userId: user.id });

    if (!account) return res.status(404).json({ message: 'Rider profile not found' });

    res.status(200).json({ account });

});

export const toggleRiderAvailability = TryCatch(async (req, res) => {

    const user = req.user;

    console.log('REQ BODY:', req.body);

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { isAvailable, latitude, longitude } = req.body;

    console.log('TOGGLE API HIT:', isAvailable);

    if (typeof isAvailable !== 'boolean') return res.status(400).json({ message: 'Type of availability must be boolean' });

    if (isNaN(latitude) || isNaN(longitude)) return res.status(400).json({ message: 'location is required' });

    const rider = await Rider.findOne({ userId: user.id });

    if (!rider) return res.status(404).json({ message: 'Rider not found' });

    if (isAvailable && !rider.isVerified) return res.status(403).json({ message: 'Rider not verified' });

    if (isAvailable) {
        try {
            await axios.get(
                `${RESTAURANT_SERVICE}/api/order/current-order/rider`,
                {
                    params: { riderId: rider._id },
                    headers: { 'x-internal-key': INTERNAL_SERVICE_KEY },
                }
            );
            return res.status(400).json({
                message: 'Complete your active delivery before going online',
            });
        } catch (error) {
            if (error?.response?.status !== 404) {
                return res.status(500).json({ message: 'Could not verify rider status' });
            }
        }
    }

    rider.isAvailable = isAvailable;
    rider.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
    };
    rider.lastActiveAt = isAvailable ? new Date() : null;

    await rider.save();

    res.status(200).json({ message: isAvailable ? 'rider is online' : 'rider is offline', rider });


});

export const updateRider = TryCatch(async (req, res) => {

    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { phone, drivingLicense, name } = req.body;

    if (!phone || !drivingLicense || !name)
        return res.status(400).json({ message: 'All fields are required' });

    const rider = await Rider.findOneAndUpdate({ userId: user.id }, { phone, drivingLicense }, { returnDocument: 'after' });

    if (!rider) return res.status(404).json({ message: 'Rider not found' });

    await axios.patch(
        `${AUTH_SERVICE}/api/auth/internal/update-user`,
        { userId: user.id, name },
        {
            headers: {
                'x-internal-key': INTERNAL_SERVICE_KEY
            }
        }
    );

    res.status(200).json({ message: 'Profile updated', rider });
});

export const riderHeartbeat = TryCatch(async (req, res) => {

    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });

    const rider = await Rider.findOne({ userId: req.user.id });

    if (!rider)
        return res.status(404).json({ message: 'Rider not found' });

    let isActive = rider.isAvailable;

    if (!isActive) {
        try {
            const { data } = await axios.get(
                `${RESTAURANT_SERVICE}/api/order/current-order/rider`,
                {
                    params: { riderId: rider._id },
                    headers: { 'x-internal-key': INTERNAL_SERVICE_KEY },
                }
            );
            isActive = !!data.order;
        } catch (error) {
            if (error?.response?.status !== 404) {
                return res.status(500).json({ message: 'Could not verify rider activity' });
            }
        }
    }

    if (!isActive) {
        return res.status(200).json({ success: false, message: 'Rider offline' });
    }

    rider.lastActiveAt = new Date();
    await rider.save();

    res.status(200).json({
        success: true,
        message: 'Heartbeat updated',
        lastActiveAt: rider.lastActiveAt,
    });

});

export const acceptOrderRider = TryCatch(async (req, res) => {

    const riderUserId = req.user?.id;

    const { orderId } = req.params;

    const rider = await Rider.findOne({
        userId: riderUserId,
        isAvailable: true
    });
    console.log(rider)
    if (!rider) {
        return res.status(404).json({
            message: 'Rider not found or unavailable'
        });
    }

    try {

        const { data } = await axios.put(
            `${RESTAURANT_SERVICE}/api/order/assign-rider`,
            {
                riderId: rider._id,
                orderId,
                riderUserId: rider.userId,
                riderName: req.user.name,
                riderPicture: rider.picture,
                riderPhone: rider.phone,
            },
            {
                headers: {
                    'x-internal-key': INTERNAL_SERVICE_KEY
                }
            }
        );

        if (data.success) {

            const riderDetails = await Rider.findOneAndUpdate(
                {
                    userId: rider.userId,
                    isAvailable: true
                },
                {
                    isAvailable: false
                },
                {
                    returnDocument: 'after'
                }
            );
            console.log('RIDER AFTER UPDATE:', riderDetails);
            return res.status(200).json({
                success: true,
                message: 'Order accepted',
                riderDetails
            });

            console.log('rider detail after accept', riderDetails)
        }
    } catch (error) {

        return res.status(400).json({
            message: 'Order already taken'
        });
    }
});;

export const fetchCurrentOrders = TryCatch(async (req, res) => {

    const riderUserId = req.user?.id;

    if (!riderUserId) {
        return res.status(401).json({
            message: 'Login please'
        });
    }

    const rider = await Rider.findOne({
        userId: riderUserId
    });

    console.log('DB RIDER:', rider);

    if (!rider) {
        return res.status(200).json({
            success: true,
            order: null
        });
    }

    try {

        const { data } = await axios.get(
            `${RESTAURANT_SERVICE}/api/order/current-order/rider`,
            {
                params: {
                    riderId: rider._id
                },
                headers: {
                    'x-internal-key': INTERNAL_SERVICE_KEY
                }
            }
        );

        if (data.order && rider.isAvailable) {
            await Rider.findOneAndUpdate(
                { userId: riderUserId },
                { isAvailable: false }
            );
        }

        return res.status(200).json({
            success: true,
            order: data.order
        });

    } catch (error) {
        if (error?.response?.status === 404) {
            return res.status(200).json({ success: true, order: null });
        }
        return res.status(error?.response?.status || 500).json({ message: error?.response?.data?.message || 'Internal server error' });
    }

});

export const updateOrderStatus = TryCatch(async (req, res) => {

    const riderUserId = req.user?.id;

    const { orderId } = req.params;

    if (!riderUserId) {
        return res.status(401).json({
            message: 'Login please'
        });
    }

    const rider = await Rider.findOne({
        userId: riderUserId,
        isAvailable: false
    });

    if (!rider) {
        return res.status(404).json({
            message: 'Rider not found'
        });
    }

    try {

        const { data } = await axios.put(
            `${RESTAURANT_SERVICE}/api/order/update-order/rider`,
            { orderId },
            {
                headers: {
                    'x-internal-key': INTERNAL_SERVICE_KEY
                }
            }
        );

        // delivery completed
        if (data.order.status === 'delivered') {

            await Rider.findOneAndUpdate(
                {
                    userId: riderUserId
                },
                {
                    isAvailable: true
                },
                {
                    returnDocument: 'after'
                }
            );

        }

        return res.status(200).json({
            success: true,
            message: data.message,
            order: data.order
        });

    } catch (error) {

        return res.status(500).json({
            message: 'Internal server error'
        });

    }

});

export const riderIncome = TryCatch(async (req, res) => {

    const rider = await Rider.findOne({
        userId: req.user.id
    });

    if (!rider) {
        return res.status(404).json({
            message: 'Rider not found'
        });
    }

    const now = new Date();

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const { data } = await axios.get(
        `${RESTAURANT_SERVICE}/api/order/internal/rider-income`,
        {
            params: {
                riderId: rider._id.toString(),
                today: startOfToday.toISOString(),
                month: startOfMonth.toISOString(),
            },
            headers: {
                'x-internal-key': INTERNAL_SERVICE_KEY
            }
        }
    );

    res.status(200).json({
        success: true,
        totalIncome: data.totalIncome || 0,
        totalDeliveries: data.totalDeliveries || 0,
        todayIncome: data.todayIncome || 0,
        monthlyIncome: data.monthlyIncome || 0,
    });

});