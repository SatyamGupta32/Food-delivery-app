import express from 'express';
import {
    riderProfile,
    fetchRiderProfile,
    toggleRiderAvailability,
    updateRider,
    riderHeartbeat,
    acceptOrderRider,
    fetchCurrentOrders,
    updateOrderStatus,
    riderIncome
} from '../controllers/riderController.js';
import { isAuth, isRider } from '../middlewares/isAuth.js';
import upload from '../middlewares/multer.js';


const router = express.Router();

router.post('/create-profile', isAuth, isRider, upload, riderProfile);
router.get('/myprofile', isAuth, isRider, fetchRiderProfile);
router.patch('/availability', isAuth, isRider, toggleRiderAvailability);
router.patch('/update-profile', isAuth, isRider, updateRider);
router.patch('/heartbeat', isAuth, isRider, riderHeartbeat);
router.post('/accept-order/:orderId', isAuth, isRider, acceptOrderRider);
router.get('/current-orders', isAuth, isRider, fetchCurrentOrders);
router.put('/update-status/:orderId', isAuth, isRider,updateOrderStatus);
router.get('/income', isAuth, isRider, riderIncome);

export default router;
