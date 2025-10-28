import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { TeamService } from "../services/team.service";
import { sendSuccess } from "../utils/response";

const router = Router();
const teamService = new TeamService();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: competitionId
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
 *         description: List of teams
 *       429:
 *         description: Too many requests
 */
router.get("/", async (req, res, next) => {
  try {
    const { competitionId, page, limit } = req.query;
    const result = await teamService.getTeams({
      competitionId: competitionId
        ? parseInt(competitionId as string)
        : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendSuccess(res, result.teams, "Success", 200, result.meta);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - AuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - competitionId
 *             properties:
 *               name:
 *                 type: string
 *               competitionId:
 *                 type: integer
 *               logo:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       422:
 *         description: Validation error - Invalid input data
 *       429:
 *         description: Too many requests
 */
router.post("/", authenticate, async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body);
    sendSuccess(res, team, "Team created", 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team details
 *       404:
 *         description: Team not found
 *       429:
 *         description: Too many requests
 */
router.get("/:id", async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(parseInt(req.params.id));
    sendSuccess(res, team);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update a team
 *     tags: [Teams]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Team not found
 *       422:
 *         description: Validation error - Invalid input data
 *       429:
 *         description: Too many requests
 */
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(
      parseInt(req.params.id),
      req.body
    );
    sendSuccess(res, team);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
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
 *         description: Team deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Team not found
 *       429:
 *         description: Too many requests
 */
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const result = await teamService.deleteTeam(parseInt(req.params.id));
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/teams/{id}/matches:
 *   get:
 *     summary: Get all matches for a team
 *     tags: [Teams]
 *     security: []
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
 *         description: List of matches for the team
 *       404:
 *         description: Team not found
 *       429:
 *         description: Too many requests
 */
router.get("/:id/matches", async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await teamService.getTeamMatches(
      parseInt(req.params.id),
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
    sendSuccess(
      res,
      result.matches,
      "Matches retrieved successfully",
      200,
      result.meta
    );
  } catch (error) {
    next(error);
  }
});

export default router;
