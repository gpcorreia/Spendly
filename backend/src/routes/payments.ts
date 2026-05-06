import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
} from "../controllers/paymentsController";

const router = express.Router();

router.post("/create-checkout-session", express.json(), createCheckoutSession);
router.post("/stripe-webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
