import express from "express";
import { listUsers, updateUserRole, deleteUser } from "../controllers/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Enforce JWT Auth and verify OWNER permissions
router.use(requireAuth);
router.use(requireRole(["OWNER"]));

// User Management Routes
router.get("/", listUsers);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
