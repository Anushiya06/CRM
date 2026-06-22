import express from "express";
import { createSale } from "../controllers/saleController.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Record sales transactions (restricted to OWNER and CASHIER)
router.post("/sales", requireRole(["OWNER", "CASHIER"]), createSale);

export default router;
