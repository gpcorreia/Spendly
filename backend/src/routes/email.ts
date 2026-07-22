import express from "express";
import { handleMonthlySummaryEmail } from "../controllers/emailControllers";
import checkInternalRequest from "../middleware/checkInternalRequest";

const router = express.Router();

router.post("/monthly-summary-email", checkInternalRequest,handleMonthlySummaryEmail);

export default router;

