import { Router } from "express";
import * as authController from "#api/v1/auth/controllers/auth.controller.js";
import { authMiddleware } from "#middleware/auth.middleware.js";
import { authorizeRoles } from "#middleware/roleMiddleware.js";
import {  requireTenantScope } from "#middleware/scope.middleware.js";
import { tenantMiddleware } from "#middleware/tenant.middleware.js";
import { ROLES } from "#shared/constants/roles.js";
import rateLimitMiddleware  from "#middleware/rateLimit.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               schoolId:
 *                 type: string
 *                 nullable: true
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.post("/login", rateLimitMiddleware, authController.login);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [global_super_admin, school_super_admin, school_admin, staff, parent, student]
 *               schoolId:
 *                 type: string
 *                 nullable: true
 *             required:
 *               - email
 *               - password
 *               - role
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.post(
  "/register",
  authMiddleware,
  authorizeRoles(ROLES.GLOBAL_SUPER_ADMIN, ROLES.SCHOOL_SUPER_ADMIN),
  tenantMiddleware,
  requireTenantScope(),
  authController.register,
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh JWT tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Unauthorized
 */
router.post("/refresh", rateLimitMiddleware, authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Bad request
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/v1/auth/global-stats:
 *   get:
 *     summary: Get platform-wide statistics
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *       403:
 *         description: Forbidden
 */
router.get(
  "/global-stats",
  authMiddleware,
  authorizeRoles(ROLES.GLOBAL_SUPER_ADMIN),
  (req, res) => {
    successResponse(
      res,
      { stats: "Confidential Platform Data" },
      t("success.operation_completed", req.language),
    );
  },
);

// TODO: Add routes for password reset and email verification

export default router;
