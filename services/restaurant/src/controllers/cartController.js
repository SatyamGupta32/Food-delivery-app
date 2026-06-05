
import mongoose from "mongoose";
import { TryCatch } from "../middlewares/tryCatch.js";
import Restaurant from "../models/Restaurant.js";
import Cart from "../models/Cart.js";
import Menu from "../models/Menu.js";


export const addToCart = TryCatch(async (req, res) => {

    if (!req.user) return res.status(401).json({ message: "Please Login" });

    const userId = req.user.id;
    const { restaurantId, itemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemId))
        return res.status(400).json({ message: "Invalid Id's of restaurant or item's" });

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const item = await Menu.findOne({ _id: itemId, restaurantId });

    if (!item) return res.status(404).json({ message: "Menu item not found" });

    const addfromdiffRes = await Cart.findOne({ userId, restaurantId: { $ne: restaurantId }, });

    if (addfromdiffRes) return res.status(400).json({ message: 'Complete current order first or Clear your cart.' });

    const cart = await Cart.findOneAndUpdate(
        { userId, restaurantId, itemId },
        {
            $inc: { quantity: 1 },
            $setOnInsert: {
                userId,
                restaurantId,
                itemId,
            }
        },
        { upsert: true, returnDocument: 'after' , setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Item added to cart', cart });
});

export const fetchCart = TryCatch(async (req, res) => {

    if (!req.user) return res.status(401).json({ message: "Please Login" });

    const userId = req.user.id;

    const cartItems = await Cart.find({ userId }).populate('itemId').populate('restaurantId');

    let subTotal = 0;
    let cartLength = 0;

    for (const cartItem of cartItems) {

        const item = cartItem.itemId;

        if (!item) continue;

        subTotal += item.price * cartItem.quantity;
        cartLength += cartItem.quantity;
    }

    res.status(200).json({
        message: 'Cart fetched successfully',
        success: true,
        subTotal,
        cartLength,
        cart: cartItems,
    });
});

export const incCartQty = TryCatch(async (req, res) => {
    const userId = req.user.id;

    const { itemId } = req.body;

    if (!userId || !itemId) return res.status(400).json({ message: 'invalid request !!' });

    const cartItem = await Cart.findOneAndUpdate(
        { userId, itemId },
        { $inc: { quantity: 1 } },
        { returnDocument: 'after' }
    );

    if (!cartItem) return res.status(400).json({ message: 'Item not Found' });

    res.status(200).json({ message: 'Quantity incremented', cartItem });
});

export const decCartQty = TryCatch(async (req, res) => {
    const userId = req.user.id;

    const { itemId } = req.body;

    if (!userId || !itemId) return res.status(400).json({ message: 'invalid request !!' });

    const cartItem = await Cart.findOne(
        { userId, itemId }, 
    );

    if (!cartItem) return res.status(400).json({ message: 'Item not Found' });

    if(cartItem.quantity === 1) {
        await Cart.deleteOne({ userId, itemId });
        return res.status(200).json({ message: 'Item removed from cart' });
    }

    cartItem.quantity -= 1;
    await cartItem.save();

    res.status(200).json({ message: 'Quantity decremented', cartItem });
});

export const clearCart = TryCatch(async (req, res) => {
    const userId = req.user.id;
    if(!userId) return res.status(401).json({ message: 'Unauthorised'});
    
    await Cart.deleteMany({ userId });

    res.status(200).json({ message: 'Cart Cleared' });
});
