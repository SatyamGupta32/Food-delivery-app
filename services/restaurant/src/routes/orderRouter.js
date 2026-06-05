import express from 'express';
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import {
    assignRider,
    createOrder,
    fetchOrder,
    getMyOrders,
    getOrderForRider,
    getPaymentOrders,
    getRestaurantOrders,
    updateOrderStatus,
    updateOrderStatusRider,
    getRiderIncome
} from '../controllers/orderController.js';


const router = express.Router();

router.get('/my-orders', isAuth, getMyOrders);
router.post('/create', isAuth, createOrder);
router.get('/payment/:id', getPaymentOrders);
router.get('/restaurant-orders/:restaurantId', isAuth, isSeller, getRestaurantOrders);
router.put('/assign-rider', assignRider);
router.get('/current-order/rider', getOrderForRider);
router.get('/internal/rider-income', getRiderIncome);
router.put('/update-order/rider', updateOrderStatusRider);
router.put('/:orderId', isAuth, isSeller, updateOrderStatus);
router.get('/:id', isAuth, fetchOrder);



export default router;