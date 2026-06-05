import axios from "axios";
import mongoose from "mongoose";
import { TryCatch } from '../middlewares/tryCatch.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Address from '../models/Address.js';
import Restaurant from '../models/Restaurant.js';
import { INTERNAL_SERVICE_KEY, REALTIME_SERVICE } from '../config/env.js';
import { getDistance } from '../utils/getDistance.js';
import { publishEvent } from "../config/order.publisher.js";

const ALLOWED_STATUS = ['accepted', 'preparing', 'ready_for_rider'];  // Note: for updateOrderStatus controller


export const createOrder = TryCatch(async (req, res) => {
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { paymentMethod, addressId } = req.body;

    if (!addressId) return res.status(400).json({ message: 'Address is required' });

    const address = await Address.findOne({
        _id: addressId,
        userId: user.id,
    });

    if (!address) return res.status(404).json({ message: 'Address not found' });

    const cartItem = await Cart.find({ userId: user.id })
        .populate('itemId')
        .populate('restaurantId');


    if (cartItem.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const firstItem = cartItem[0];

    if (!firstItem || !firstItem.restaurantId) return res.status(400).json({ message: 'Invalid Cart data' });

    const restaurantId = firstItem.restaurantId._id;

    const restaurant = await Restaurant.findById(restaurantId);

    const restaurantCoordinates = restaurant.autoLocation.coordinates;
    const userCoordinates = address.location.coordinates;

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (!restaurant.isOpen) return res.status(404).json({ message: 'Sorry Restaurant is closed' });

    if (!restaurant.autoLocation || !restaurant.autoLocation.coordinates) return res.status(400).json({ message: 'Restaurant coordinates not found' });

    if (!address.location || !address.location.coordinates) return res.status(400).json({ message: 'User coordinates not found' });


    const distance = getDistance(
        restaurantCoordinates[1],
        restaurantCoordinates[0],
        userCoordinates[1],
        userCoordinates[0]
    );

    let subTotal = 0;

    const orderItems = cartItem.map((cart) => {

        const item = cart.itemId;

        if (!item) throw new Error('Invalid Cart Item');

        const itemTotal = item.price * cart.quantity;
        subTotal += itemTotal;

        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cart.quantity,
        }
    });

    const deliveryFee = subTotal < 250 ? 49 : 0;
    const platformFee = 7;
    const total = subTotal + deliveryFee + platformFee;

    const expireAt = new Date(Date.now() + 15 * 60 * 1000);

    const [longitude, latitude] = address.location.coordinates;

    const riderAmount = Math.ceil(distance) * 17;

    const order = await Order.create({
        userId: user.id,
        restaurantId: restaurantId,
        restaurantName: restaurant.name,
        riderId: null,
        distance,
        riderAmount,
        items: orderItems,
        subTotal,
        deliveryFee,
        platformFee,
        totalPrice: total,
        addressId: address._id,
        deliveryAddress: {
            formattedAddress: address.formattedAddress,
            mobile: address.mobile,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
        },
        paymentMethod,
        paymentStatus: 'pending',
        status: 'placed',
        expireAt,
    });
    console.log(order)
    await Cart.deleteMany({ userId: user.id });

    res.status(200).json({
        message: 'Order created successfully',
        orderId: order._id,
        amount: total,
    });
});

export const getPaymentOrders = TryCatch(async (req, res) => {

    if (req.headers['x-internal-key'] !== INTERNAL_SERVICE_KEY) return res.status(403).json({ message: 'forbidden' });

    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.paymentStatus !== 'pending' || order.status === 'cancelled') return res.status(400).json({ message: 'Payment already done' });

    res.status(200).json({
        orderId: order._id,
        total: order.totalPrice,
        currency: 'INR',
    });
});

export const getRestaurantOrders = TryCatch(async (req, res) => {
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { restaurantId } = req.params;

    if (!restaurantId) return res.status(400).json({ message: 'Restaurant not found' });

    const limit = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({ restaurantId, paymentStatus: 'paid' }).sort({ createdAt: -1 }).limit(limit);

    return res.status(200).json({ success: true, count: orders.length, orders });

});

export const updateOrderStatus = TryCatch(async (req, res) => {

    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { orderId } = req.params;

    const { status } = req.body;

    if (!orderId) return res.status(400).json({ message: 'Order ID not found' });

    if (!ALLOWED_STATUS.includes(status)) return res.status(400).json({ message: 'Invalid Order status.' });

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.paymentStatus !== 'paid') return res.status(400).json({ message: 'Order not Paid' });

    const restaurant = await Restaurant.findById(order.restaurantId);

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (restaurant.ownerId !== user.id) return res.status(401).json({ message: 'Not owner of this Restaurant' });

    order.status = status;

    await order.save();

    await axios.post(`${REALTIME_SERVICE}/api/v1/internal/emit`, {
        event: 'Order-Update',
        room: `user:${order.userId}`,
        payload: { orderId: order._id, status: order.status }
    }, {
        headers: {
            'x-internal-key': INTERNAL_SERVICE_KEY,
        }
    });

    // Now assign Rider's
    if (status === 'ready_for_rider') {
        console.log('Order ready for rider', order._id);

        await publishEvent('ORDER_READY_FOR_RIDER', { orderId: order.id, restaurantId: restaurant.id, location: restaurant.autoLocation });

        console.log('Event published successfully');
    }


    res.status(200).json({ success: true, message: 'Order status updated successfully', order });
});

export const getMyOrders = TryCatch(async (req, res) => {

    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const orders = await Order.find({ userId: user.id, paymentStatus: 'paid' }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
});

export const fetchOrder = TryCatch(async (req, res) => {

    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const order = await Order.findById(req.params.id);

    // console.log(JSON.stringify(order, null, 2));

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId != user.id) return res.status(401).json({ message: 'Not allowed to access this order' });

    return res.status(200).json({ success: true, order });
});

export const assignRider = TryCatch(async (req, res) => {

    if (req.headers['x-internal-key'] !== INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    const {
        orderId,
        riderId,
        riderName,
        riderPhone
    } = req.body;

    if (!orderId || !riderId) {
        return res.status(400).json({
            message: 'OrderId and RiderId are required'
        });
    }

    const orderUpdate = await Order.findOneAndUpdate(
        {
            _id: orderId,
            riderId: null,
        },
        {
            riderId,
            riderName,
            riderPhone,
            status: 'rider_assigned',
        },
        {
           returnDocument: 'after'
        }
    );

    if (!orderUpdate) {
        return res.status(400).json({
            message: 'Order already taken'
        });
    }

    await axios.post(
        `${REALTIME_SERVICE}/api/v1/internal/emit`,
        {
            event: 'order:rider_assigned',
            room: `user:${orderUpdate.userId}`,
            payload: orderUpdate,
        },
        {
            headers: {
                'x-internal-key': INTERNAL_SERVICE_KEY,
            },
        }
    );

    await axios.post(
        `${REALTIME_SERVICE}/api/v1/internal/emit`,
        {
            event: 'order:rider_assigned',
            room: `restaurant:${orderUpdate.restaurantId}`,
            payload: orderUpdate,
        },
        {
            headers: {
                'x-internal-key': INTERNAL_SERVICE_KEY,
            },
        }
    );

    return res.status(200).json({
        success: true,
        message: 'Rider assigned successfully',
        order: orderUpdate,
    });

});

export const getOrderForRider = TryCatch(async (req, res) => {

    if (req.headers['x-internal-key'] !== INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    const { riderId } = req.query;

    if (!riderId) {
        return res.status(400).json({
            message: 'RiderId is required'
        });
    }

    const order = await Order.findOne({
        riderId,
        status: {
            $in: ['rider_assigned', 'picked_up']
        }
    }).populate('restaurantId');


    console.log('FOUND ORDER:', order);
    
    if (!order) {
        return res.status(404).json({
            message: 'Order not found'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Order fetched successfully',
        order,
    });

});

export const updateOrderStatusRider = TryCatch(async (req, res) => {

    if (req.headers['x-internal-key'] !== INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({
            message: 'OrderId is required'
        });
    }

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            message: 'Order not found'
        });
    }

    let eventName = '';

    if (order.status === 'rider_assigned') {

        order.status = 'picked_up';
        eventName = 'order:picked_up';

    } else if (order.status === 'picked_up') {

        order.status = 'delivered';
        eventName = 'order:delivered';

    } else {

        return res.status(400).json({
            message: 'Invalid order status transition'
        });

    }

    await order.save();

    await axios.post(
        `${REALTIME_SERVICE}/api/v1/internal/emit`,
        {
            event: eventName,
            room: `restaurant:${order.restaurantId}`,
            payload: order,
        },
        {
            headers: {
                'x-internal-key': INTERNAL_SERVICE_KEY,
            },
        }
    );

    await axios.post(
        `${REALTIME_SERVICE}/api/v1/internal/emit`,
        {
            event: eventName,
            room: `user:${order.userId}`,
            payload: order,
        },
        {
            headers: {
                'x-internal-key': INTERNAL_SERVICE_KEY,
            },
        }
    );

    return res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        order,
    });

});

export const getRiderIncome = TryCatch(async (req, res) => {

    if (req.headers['x-internal-key'] !== INTERNAL_SERVICE_KEY) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { riderId } = req.query;

    if (!riderId) {
        return res.status(400).json({ message: 'RiderId is required' });
    }

    const now = new Date();
    const startOfToday = req.query.today
        ? new Date(req.query.today)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = req.query.month
        ? new Date(req.query.month)
        : new Date(now.getFullYear(), now.getMonth(), 1);

    const [result] = await Order.aggregate([
        {
            $match: {
                riderId: new mongoose.Types.ObjectId(riderId),
                status: 'delivered',
            },
        },
        {
            $facet: {
                overall: [
                    {
                        $group: {
                            _id: null,
                            totalDeliveries: { $sum: 1 },
                            totalIncome: { $sum: '$riderAmount' },
                        },
                    },
                ],
                today: [
                    { $match: { updatedAt: { $gte: startOfToday } } },
                    { $group: { _id: null, income: { $sum: '$riderAmount' } } },
                ],
                monthly: [
                    { $match: { updatedAt: { $gte: startOfMonth } } },
                    { $group: { _id: null, income: { $sum: '$riderAmount' } } },
                ],
            },
        },
    ]);

    const overall = result?.overall?.[0] || {};
    const today = result?.today?.[0] || {};
    const monthly = result?.monthly?.[0] || {};

    return res.status(200).json({
        success: true,
        totalIncome: overall.totalIncome || 0,
        totalDeliveries: overall.totalDeliveries || 0,
        todayIncome: today.income || 0,
        monthlyIncome: monthly.income || 0,
    });

});