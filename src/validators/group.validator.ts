import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  competitionId: z.number().int().positive(),
  visibility: z.enum(["private", "public"]).default("private"),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  visibility: z.enum(["private", "public"]).optional(),
});

export const createScoringRuleSchema = z.object({
  ruleType: z.enum(['EXACT_SCORE', 'CORRECT_WINNER', 'CORRECT_DRAW', 'GOAL_DIFFERENCE', 'BOTH_TEAMS_SCORE']),
  ruleDescription: z.string().optional(),
  points: z.number().int(),
});

export const updateScoringRuleSchema = z.object({
  ruleType: z.enum(['EXACT_SCORE', 'CORRECT_WINNER', 'CORRECT_DRAW', 'GOAL_DIFFERENCE', 'BOTH_TEAMS_SCORE']).optional(),
  ruleDescription: z.string().optional(),
  points: z.number().int().optional(),
});

export const inviteToGroupSchema = z.object({
  email: z.string().email(),
});
