import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validators/auth.validator";

const router = Router();
const authService = new AuthService();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Conflict - Email or username already exists
 *       422:
 *         description: Validation error - Invalid input data
 *       429:
 *         description: Too many requests
 */
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    sendSuccess(res, result, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       422:
 *         description: Validation error - Invalid input data
 *       429:
 *         description: Too many requests
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    sendSuccess(res, result, "Login successful");
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - AuthToken: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 */
router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - AuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error - Invalid input data
 *       429:
 *         description: Too many requests
 */
router.put("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.user!.userId, data);
    sendSuccess(res, user, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - AuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Unauthorized - Invalid or missing token / Current password is incorrect
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error - Invalid input data
 *       429:
 *         description: Too many requests
 */
router.post(
  "/change-password",
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(
        req.body
      );
      const result = await authService.changePassword(
        req.user!.userId,
        currentPassword,
        newPassword
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - AuthToken: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       429:
 *         description: Too many requests
 */
router.post("/logout", authenticate, async (req: AuthRequest, res, next) => {
  try {
    sendSuccess(res, { message: "Logout successful" });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     security:
 *       - AuthToken: []
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 */
router.post("/refresh", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await authService.refreshToken(req.user!.userId);
    sendSuccess(res, result, "Token refreshed successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
