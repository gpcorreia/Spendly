import express from "express";
import { handleMonthlySummaryEmail } from "../controllers/emailControllers";

const router = express.Router();

router.post("/monthly-summary-email", handleMonthlySummaryEmail);

export default router;

