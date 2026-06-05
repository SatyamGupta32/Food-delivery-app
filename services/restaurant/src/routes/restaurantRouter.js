import express from 'express';
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import upload from '../middlewares/multer.js';
import {
    addRestaurant,
    fetchMyRestaurant,
    fetchSingleRestaurant,
    getNearByRestaurants,
    updateRestaurant,
    updateStatus,
    restaurantHeartbeat,
    restaurantSales
} from '../controllers/restaurantController.js';


const router = express.Router();

router.get('/nearby', isAuth, getNearByRestaurants);
router.post('/add-restaurant', isAuth, isSeller, upload, addRestaurant);
router.get('/my-restaurant', isAuth, isSeller, fetchMyRestaurant);
router.put('/status', isAuth, isSeller, updateStatus);
router.put('/edit-restaurant', isAuth, isSeller, updateRestaurant);
router.patch('/heartbeat', isAuth, isSeller, restaurantHeartbeat);
router.get('/sales', isAuth, isSeller, restaurantSales);
router.get('/:id', isAuth, fetchSingleRestaurant);

export default router;
