import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { InvitationService } from "../services/invitation.service";
import { sendSuccess } from "../utils/response";

const router = Router();
const invitationService = new InvitationService();

/**
 * @swagger
 * /api/invitations:
 *   post:
 *     summary: Send an invitation to join a group
 *     tags: [Invitations]
 *     security:
 *       - AuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteeEmail
 *               - groupId
 *             properties:
 *               inviteeEmail:
 *                 type: string
 *                 format: email
 *               groupId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       422:
 *         description: Validation error - Invalid input data
 *       429:
 *         description: Too many requests
 */
router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const invitation = await invitationService.createInvitation(
      req.user!.userId,
      req.body
    );
    sendSuccess(res, invitation, "Invitation sent successfully", 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/invitations/received:
 *   get:
 *     summary: Get received invitations
 *     tags: [Invitations]
 *     security:
 *       - AuthToken: []
 *     responses:
 *       200:
 *         description: List of received invitations
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       429:
 *         description: Too many requests
 */
router.get("/received", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const invitations = await invitationService.getReceivedInvitations(
      req.user!.email
    );
    sendSuccess(res, invitations);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/invitations/sent:
 *   get:
 *     summary: Get sent invitations
 *     tags: [Invitations]
 *     security:
 *       - AuthToken: []
 *     responses:
 *       200:
 *         description: List of sent invitations
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       429:
 *         description: Too many requests
 */
router.get("/sent", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const invitations = await invitationService.getSentInvitations(
      req.user!.userId
    );
    sendSuccess(res, invitations);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/invitations/{token}/accept:
 *   post:
 *     summary: Accept an invitation
 *     tags: [Invitations]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation accepted
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Invitation not found
 *       429:
 *         description: Too many requests
 */
router.post(
  "/:token/accept",
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await invitationService.acceptInvitation(
        req.params.token,
        req.user!.userId,
        req.user!.email
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/invitations/{token}/reject:
 *   post:
 *     summary: Reject an invitation
 *     tags: [Invitations]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation rejected
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Invitation not found
 *       429:
 *         description: Too many requests
 */
router.post(
  "/:token/reject",
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const result = await invitationService.rejectInvitation(
        req.params.token,
        req.user!.email
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/invitations/{id}:
 *   delete:
 *     summary: Delete an invitation
 *     tags: [Invitations]
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
 *         description: Invitation deleted
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Invitation not found
 *       429:
 *         description: Too many requests
 */
router.delete("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await invitationService.deleteInvitation(
      parseInt(req.params.id),
      req.user!.userId
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
