import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import khataRoutes from "./routes/khataRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Public routes (no auth required)
app.use("/api/auth", authRoutes);
app.use("/api", leadRoutes); // webhook is public; lead lists are role-filtered inside router

// Auth-protected routes
app.use("/api", requireAuth);
app.use("/api", productRoutes);
app.use("/api", customerRoutes);
app.use("/api", saleRoutes);
app.use("/api", khataRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/users", userRoutes);

// Centralized error handler
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
});
