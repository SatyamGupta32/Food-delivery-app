import axios from "axios";
import { TryCatch } from "../middlewares/tryCatch.js";
import Restaurant from "../models/Restaurant.js";
import getBuffer from "../config/dataUri.js";
import Menu from "../models/Menu.js";
import mongoose from "mongoose";

export const addMenu = TryCatch(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const restaurant = await Restaurant.findOne({ ownerId: req.user.id });

  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });

  const { name, description, price } = req.body;

  if (!name || !description || price == null)
    return res.status(400).json({ message: "All fields are required" });

  const file = req.file;

  if (!file) return res.status(400).json({ message: "please Upload Image" });

  const fileBuffer = getBuffer(file);

  if (!fileBuffer?.content)
    return res
      .status(400)
      .json({ message: "Invalid file/ Failed to create Buffer File." });

  const { data } = await axios.post(
    `${process.env.UTILS_SERVICE}/api/utils/upload`,
    {
      buffer: fileBuffer.content,
    },
  );

  if (!data?.url)
    return res.status(400).json({ message: "Failed to upload image" });

  const item = await Menu.create({
    restaurantId: restaurant._id,
    name,
    description,
    price,
    image: data.url,
  });

  return res.status(200).json({
    message: "Item added successfully",
    item,
  });
});

export const fetchMenu = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid restaurant id",
    });
  }

  if (!id) return res.status(400).json({ message: "Id is required" });

  const items = await Menu.find({ restaurantId: id });

  return res.status(200).json({
    message: "Item's fetched successfully",
    items,
  });
});

export const deleteItem = TryCatch(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { itemId } = req.params;

  if (!itemId) return res.status(400).json({ message: "Item Id is required" });

  const item = await Menu.findById(itemId);

  if (!item) return res.status(404).json({ message: "No Item found" });

  const restaurant = await Restaurant.findOne({
    _id: item.restaurantId,
    ownerId: req.user.id,
  });

  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });

  await item.deleteOne();

  return res.status(200).json({
    message: "Item deleted successfully",
  });
});

export const toggleItem = TryCatch(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { itemId } = req.params;

  if (!itemId) return res.status(400).json({ message: "Item Id is required" });

  const item = await Menu.findById(itemId);

  if (!item) return res.status(404).json({ message: "No Item found" });

  const restaurant = await Restaurant.findOne({
    _id: item.restaurantId,
    ownerId: req.user.id,
  });

  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });

  item.isAvailable = !item.isAvailable;

  await item.save();

  res.status(200).json({
    message: `Item marked as ${item.isAvailable ? "Available" : "Unavailable"}`,
    item,
  });
});

export const searchMenuItems = TryCatch(async (req, res) => {
  const { query = "" } = req.query;

  if (!query.trim()) {
    return res.json({
      success: true,
      restaurants: [],
      products: [],
    });
  }

  const regex = new RegExp(query, "i");

  const [restaurants, products] = await Promise.all([

    // Restaurant Search
    Restaurant.find({
      name: regex,
    }).select(
      "_id name image description autoLocation"
    ),

    // Product Search
    Menu.aggregate([
      {
        $match: {
          isAvailable: true,
          $or: [
            { name: regex },
            { description: regex }
          ]
        }
      },
      {
        $lookup: {
          from: Restaurant.collection.name,
          localField: "restaurantId",
          foreignField: "_id",
          as: "restaurant"
        }
      },
      {
        $unwind: "$restaurant"
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          price: 1,
          description: 1,

          restaurant: {
            _id: "$restaurant._id",
            name: "$restaurant.name",
            image: "$restaurant.image"
          }
        }
      },
      {
        $limit: 20
      }
    ])
  ]);

  res.status(200).json({
    success: true,
    restaurants,
    products
  });
});

export const getSingleItem = TryCatch(async (req, res) => {

  const { id } = req.params;

  const item = await Menu.findById(id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found"
    });
  }

  const restaurant = await Restaurant.findById(
    item.restaurantId
  ).select("_id name image");

  const relatedProducts = await Menu.find({
    restaurantId: item.restaurantId,
    _id: { $ne: item._id },
    isAvailable: true
  })
    .limit(4);

  res.status(200).json({
    item: {
      ...item.toObject(),
      restaurant
    },
    relatedProducts
  });

});