import { Router } from "express";
import authRoutes from "#api/v1/auth/routes/auth.routes.js";
import healthRoutes from "#api/v1/routes/health.routes.js";

const router = Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/health", healthRoutes);
// Add other routes here (e.g., superadmin, etc.)

export default router;
