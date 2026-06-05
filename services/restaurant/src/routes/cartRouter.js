import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { addToCart, clearCart, decCartQty, fetchCart, incCartQty } from '../controllers/cartController.js';


const router = express.Router();

router.post('/add-cart', isAuth, addToCart);
router.get('/fetch-cart', isAuth, fetchCart);
router.put('/inc-cart', isAuth, incCartQty);
router.put('/dec-cart', isAuth, decCartQty);
router.delete('/clear-cart', isAuth, clearCart);

export default router;