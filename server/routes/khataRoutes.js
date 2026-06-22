import express from "express";
import { 
  listKhataAccounts, 
  applyKhataPayment, 
  listDefaulters 
} from "../controllers/khataController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// All ledger endpoints require authentication
router.use(requireAuth);

// Defaulters list (OWNER only)
router.get("/khata/defaulters", requireRole(["OWNER"]), listDefaulters);

// Standard ledger endpoints (OWNER and CASHIER only)
router.get("/khata", requireRole(["OWNER", "CASHIER"]), listKhataAccounts);
router.post("/khata", requireRole(["OWNER", "CASHIER"]), applyKhataPayment);

export default router;
