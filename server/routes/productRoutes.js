import express from "express";
import {
  listProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// View products catalog (OWNER and CASHIER only)
router.get("/products", requireRole(["OWNER", "CASHIER"]), listProducts);
router.get("/products/:id", requireRole(["OWNER", "CASHIER"]), getProductById);

// Manage products (OWNER only)
router.post("/products", requireRole(["OWNER"]), createProduct);
router.put("/products/:id", requireRole(["OWNER"]), updateProduct);
router.delete("/products/:id", requireRole(["OWNER"]), deleteProduct);

export default router;
