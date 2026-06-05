import express from 'express';
import { getPendingRestaurants, getPendingRiders, getVerifiedRestaurants, getVerifiedRiders, unverifyRestaurant, unverifyRider, verifyRestaurant, verifyRider } from '../controllers/adminControllers.js';
import { isAdmin, isAuth } from '../middlewares/isAuth.js';


const router = express.Router();

router.get('/pending/riders',isAuth, isAdmin, getPendingRiders);
router.get('/verified/riders',isAuth,isAdmin,getVerifiedRiders);
router.get('/verified/restaurants',isAuth,isAdmin,getVerifiedRestaurants);
router.get('/pending/restaurants',isAuth, isAdmin, getPendingRestaurants);
router.patch('/verify/restaurant/:id',isAuth, isAdmin,verifyRestaurant);
router.patch('/unverify/restaurant/:id',isAuth,isAdmin,unverifyRestaurant);
router.patch('/verify/rider/:id',isAuth, isAdmin,verifyRider);
router.patch('/unverify/rider/:id',isAuth,isAdmin,unverifyRider);


export default router;