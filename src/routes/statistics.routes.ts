import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { StatisticsService } from "../services/statistics.service";
import { sendSuccess } from "../utils/response";

const router = Router();
const statisticsService = new StatisticsService();

/**
 * @swagger
 * /api/statistics/me:
 *   get:
 *     summary: Get current user statistics
 *     tags: [Statistics]
 *     security:
 *       - AuthToken: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       429:
 *         description: Too many requests
 */
router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const stats = await statisticsService.getUserStatistics(req.user!.userId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/statistics/groups/{id}:
 *   get:
 *     summary: Get group statistics
 *     tags: [Statistics]
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
 *         description: Group statistics
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Group not found
 *       429:
 *         description: Too many requests
 */
router.get("/groups/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const stats = await statisticsService.getGroupStatistics(
      parseInt(req.params.id),
      req.user!.userId
    );
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/statistics/leaderboard:
 *   get:
 *     summary: Get global leaderboard
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: competitionId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Leaderboard
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Group not found
 *       429:
 *         description: Too many requests
 */
router.get("/leaderboard", async (req, res, next) => {
  try {
    const { competitionId, limit } = req.query;
    const leaderboard = await statisticsService.getLeaderboard({
      competitionId: competitionId
        ? parseInt(competitionId as string)
        : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendSuccess(res, leaderboard);
  } catch (error) {
    next(error);
  }
});

export default router;
