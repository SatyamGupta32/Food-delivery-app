import express from "express";
import { createRzpOrder, createStripeOrder, verifyRzpPayment, verifyStripePayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/razorpay/create", createRzpOrder);
router.post("/razorpay/verify", verifyRzpPayment);

router.post("/stripe/create", createStripeOrder);
router.post("/stripe/verify", verifyStripePayment);

export default router;

