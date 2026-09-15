import express from "express";
import { ReportController } from "../controllers/reportController.js";

const router = express.Router();

router.get("/total", ReportController.getTotalCustomers);

export default router;
