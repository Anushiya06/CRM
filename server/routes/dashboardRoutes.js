import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Get aggregated dashboard statistics (restricted to OWNER only)
router.get("/dashboard", requireRole(["OWNER"]), getDashboard);

export default router;
