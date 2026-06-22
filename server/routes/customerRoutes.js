import express from "express";
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/customerController.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Read customer list and history (OWNER, SALES_EXEC, and CASHIER)
router.get("/customers", requireRole(["OWNER", "SALES_EXEC", "CASHIER"]), listCustomers);
router.get("/customers/:id", requireRole(["OWNER", "SALES_EXEC", "CASHIER"]), getCustomerById);

// Direct customer registry management (OWNER and SALES_EXEC only)
router.post("/customers", requireRole(["OWNER", "SALES_EXEC"]), createCustomer);
router.put("/customers/:id", requireRole(["OWNER", "SALES_EXEC"]), updateCustomer);
router.delete("/customers/:id", requireRole(["OWNER"]), deleteCustomer);

export default router;
