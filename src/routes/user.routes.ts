import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";

const router = Router();
const userService = new UserService();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       429:
 *         description: Too many requests
 */
router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await userService.getUsers(page, limit);
    sendSuccess(
      res,
      result.users,
      "Users retrieved successfully",
      200,
      result.meta
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 */
router.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id));
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}/statistics:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 */
router.get(
  "/:id/statistics",
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const stats = await userService.getUserStatistics(
        parseInt(req.params.id)
      );
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{id}/groups:
 *   get:
 *     summary: Get user's groups
 *     tags: [Users]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's groups
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 */
router.get("/:id/groups", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await userService.getUserGroups(
      parseInt(req.params.id),
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
    sendSuccess(
      res,
      result.groups,
      "Groups retrieved successfully",
      200,
      result.meta
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}/predictions:
 *   get:
 *     summary: Get user's predictions
 *     tags: [Users]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's predictions
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 */
router.get(
  "/:id/predictions",
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { page, limit } = req.query;
      const result = await userService.getUserPredictions(
        parseInt(req.params.id),
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      sendSuccess(
        res,
        result.predictions,
        "Predictions retrieved successfully",
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
