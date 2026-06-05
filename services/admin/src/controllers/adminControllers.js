import { TryCatch } from "../middlewares/tryCatch.js";
import { ObjectId } from 'mongodb';
import { restaurantCollection, ridersCollection } from '../utils/collection.js';
import { enrichRiders, enrichRestaurants } from '../utils/enrichData.js';

export const getPendingRestaurants = TryCatch(async (req, res) => {
    const restaurants = await (await restaurantCollection())
        .find({ isVerified: false })
        .toArray();

    const enriched = await enrichRestaurants(restaurants);

    res.status(200).json({
        success: true,
        message: "Pending restaurants fetched successfully",
        restaurants: enriched,
        count: enriched.length,
    });
});

export const getVerifiedRestaurants = TryCatch(async (req, res) => {
    const restaurants = await (await restaurantCollection())
        .find({ isVerified: true })
        .toArray();

    const enriched = await enrichRestaurants(restaurants);

    return res.status(200).json({
        success: true,
        message: "Verified restaurants fetched successfully",
        restaurants: enriched,
        count: enriched.length,
    });
});

export const getPendingRiders = TryCatch(async (req, res) => {
    const riders = await (await ridersCollection())
        .find({ isVerified: false })
        .toArray();

    const enriched = await enrichRiders(riders);

    res.status(200).json({
        success: true,
        message: "Pending riders fetched successfully",
        riders: enriched,
        count: enriched.length,
    });
});

export const getVerifiedRiders = TryCatch(async (req, res) => {
    const riders = await (await ridersCollection())
        .find({ isVerified: true })
        .toArray();

    const enriched = await enrichRiders(riders);

    return res.status(200).json({
        success: true,
        message: "Verified riders fetched successfully",
        riders: enriched,
        count: enriched.length,
    });
});

export const verifyRestaurant = TryCatch(async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid restaurant id",
        });
    }

    const restaurant = await (await restaurantCollection()).updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                isVerified: true,
                updatedAt: new Date(),
                lastActiveAt: new Date(),
            },
        }
    );

    if (restaurant.matchedCount === 0) {
        return res.status(404).json({
            success: false,
            message: "Restaurant not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Restaurant verified successfully",
    });
});

export const unverifyRestaurant = TryCatch(async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid restaurant id",
        });
    }

    const restaurant = await (await restaurantCollection()).updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                isVerified: false,
                updatedAt: new Date(),
            },
        }
    );

    if (restaurant.matchedCount === 0) {
        return res.status(404).json({
            success: false,
            message: "Restaurant not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Restaurant verification cancelled successfully",
    });
});

export const verifyRider = TryCatch(async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid rider id",
        });
    }

    const rider = await (await ridersCollection()).updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                isVerified: true,
                updatedAt: new Date(),
                lastActiveAt: new Date(),
            },
        }
    );

    if (rider.matchedCount === 0) {
        return res.status(404).json({
            success: false,
            message: "Rider not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Rider verified successfully",
    });
});

export const unverifyRider = TryCatch(async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid rider id",
        });
    }

    const rider = await (await ridersCollection()).updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                isVerified: false,
                updatedAt: new Date(),
            },
        }
    );

    if (rider.matchedCount === 0) {
        return res.status(404).json({
            success: false,
            message: "Rider not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Rider verification cancelled successfully",
    });
});
