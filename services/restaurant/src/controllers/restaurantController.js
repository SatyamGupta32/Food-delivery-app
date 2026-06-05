import axios from "axios";
import { TryCatch } from "../middlewares/tryCatch.js";
import Restaurant from "../models/Restaurant.js";
import getBuffer from "../config/dataUri.js";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  INTERNAL_SERVICE_KEY,
  REALTIME_SERVICE,
} from "../config/env.js";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Menu from "../models/Menu.js";
import { UTILS_SERVICE } from "../config/env.js";

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const addRestaurant = TryCatch(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const existRes = await Restaurant.findOne({
    ownerId: user.id,
  });

  if (existRes) {
    return res.status(400).json({
      message: "You already have a Restaurant",
    });
  }

  const { name, description, latitude, longitude, formattedAddress, phone } =
    req.body;

  if (!name || !latitude || !longitude) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "please Upload Image",
    });
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer?.content) {
    return res.status(400).json({
      message: "Invalid file/ Failed to create Buffer File",
    });
  }

  const { data } = await axios.post(`${UTILS_SERVICE}/api/utils/upload`, {
    buffer: fileBuffer.content,
  });

  if (!data?.url) {
    return res.status(400).json({
      message: "Failed to upload image",
    });
  }

  const restaurant = await Restaurant.create({
    name,
    description,
    phone,
    image: data.url,
    ownerId: user.id,
    autoLocation: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
      formattedAddress,
    },
  });

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      restaurantId: restaurant._id,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.status(200).json({
    message: "Restaurant Created Successfully",
    restaurant,
    token,
  });
});

export const fetchMyRestaurant = TryCatch(async (req, res) => {
  const user = req.user;

  if (!user)
    return res.status(401).json({
      message: "Unauthorized",
    });

  const restaurant = await Restaurant.findOne({
    ownerId: user.id,
  });

  if (!restaurant)
    return res.status(404).json({
      message: "Restaurant not found",
    });

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      restaurantId: restaurant._id,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return res.status(200).json({
    message: "Restaurant fetched Successfully",
    restaurant,
    token,
  });
});

export const updateStatus = TryCatch(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { status } = req.body;

  if (typeof status !== "boolean")
    return res.status(400).json({ message: "Invalid Status" });

  const restaurant = await Restaurant.findOneAndUpdate(
    { ownerId: req.user.id },
    { isOpen: status, lastActiveAt: status ? new Date() : null },
    { returnDocument: "after" },
  );

  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });

  // realtime emit
  await axios.post(
    `${REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "restaurant-status-update",
      room: "restaurants",
      payload: { restaurantId: restaurant._id, isOpen: restaurant.isOpen },
    },
    {
      headers: {
        "x-internal-key": INTERNAL_SERVICE_KEY,
      },
    },
  );

  res.json({ message: "Status updated successfully", restaurant });
});

export const updateRestaurant = TryCatch(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { name, description } = req.body;

  const restaurant = await Restaurant.findOneAndUpdate(
    { ownerId: req.user.id },
    { name, description },
    { returnDocument: "after" },
  );

  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });

  res.json({ message: "Details updated successfully", restaurant });
});

export const getNearByRestaurants = TryCatch(async (req, res) => {
  const { latitude, longitude, radius = 15000, search = "" } = req.query;

  if (latitude == null || longitude == null)
    return res
      .status(400)
      .json({ message: "Latitude and Longitude are required" });

  const activeTime = new Date(Date.now() - 30000);
  const searchTerm = String(search || "").trim();
  const searchRegex = searchTerm
    ? new RegExp(escapeRegExp(searchTerm), "i")
    : null;

  const query = { isVerified: true };
  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: "distance",
        maxDistance: Number(radius),
        query,
        spherical: true,
      },
    },
  ];

  if (searchRegex) {
    pipeline.push({
      $match: {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { "autoLocation.formattedAddress": searchRegex },
        ],
      },
    });
  }
  
  pipeline.push(
    {
      $addFields: {
        isLive: {
          $and: [
            { $eq: ["$isOpen", true] },
            { $ne: ["$lastActiveAt", null] },
            { $gte: ["$lastActiveAt", activeTime] },
          ],
        },
        distanceKm: {
          $round: [{ $divide: ["$distance", 1000] }, 2],
        },
        distanceMeter: {
          $round: ["$distance", 0],
        },
      },
    },
    {
      $sort: {
        isLive: -1,
        isOpen: -1,
        distance: 1,
      },
    },
  );

  const restaurants = await Restaurant.aggregate(pipeline);

  res.status(200).json({
    success: true,
    count: restaurants.length,
    message: "Restaurants fetched successfully",
    restaurants,
  });
});

export const fetchSingleRestaurant = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid restaurant id",
    });
  }

  if (!id) return res.status(400).json({ message: "Id is required" });

  const restaurant = await Restaurant.findById(id);

  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });

  res.status(200).json({
    success: true,
    message: "Restaurant fetched successfully",
    restaurant,
  });
});

export const restaurantHeartbeat = TryCatch(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const restaurant = await Restaurant.findOne({
    ownerId: req.user.id,
  });

  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });

  // IMPORTANT
  if (!restaurant.isOpen) {
    return res.status(400).json({
      message: "Restaurant is closed",
    });
  }

  restaurant.lastActiveAt = new Date();

  await restaurant.save();

  res.status(200).json({
    success: true,
    message: "Heartbeat updated",
  });
});

export const restaurantSales = TryCatch(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const restaurant = await Restaurant.findOne({
    ownerId: req.user.id,
  });

  if (!restaurant) {
    return res.status(404).json({
      message: "Restaurant not found",
    });
  }

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurant._id,
      },
    },
    {
      $facet: {
        delivered: [
          { $match: { status: "delivered" } },
          {
            $group: {
              _id: null,
              completedOrders: { $sum: 1 },
              totalRevenue: { $sum: "$totalPrice" },
              restaurantIncome: { $sum: "$subTotal" },
            },
          },
        ],
        allPaid: [
          { $match: { paymentStatus: "paid" } },
          { $count: "totalOrders" },
        ],
        today: [
          {
            $match: {
              status: "delivered",
              updatedAt: { $gte: startOfToday },
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$subTotal" },
            },
          },
        ],
        monthly: [
          {
            $match: {
              status: "delivered",
              updatedAt: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$subTotal" },
            },
          },
        ],
      },
    },
  ]);

  const delivered = result?.delivered?.[0] || {};
  const allPaid = result?.allPaid?.[0] || {};
  const today = result?.today?.[0] || {};
  const monthly = result?.monthly?.[0] || {};

  res.status(200).json({
    success: true,
    totalRevenue: delivered.totalRevenue || 0,
    restaurantIncome: delivered.restaurantIncome || 0,
    totalOrders: allPaid.totalOrders || 0,
    completedOrders: delivered.completedOrders || 0,
    todayRevenue: today.revenue || 0,
    monthlyRevenue: monthly.revenue || 0,
  });
});
