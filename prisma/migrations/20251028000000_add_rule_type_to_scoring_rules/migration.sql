-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('EXACT_SCORE', 'CORRECT_WINNER', 'CORRECT_DRAW', 'GOAL_DIFFERENCE', 'BOTH_TEAMS_SCORE');

-- AlterTable
ALTER TABLE "group_scoring_rules" ADD COLUMN "rule_type" "RuleType";

-- Update existing records with default values based on their description
UPDATE "group_scoring_rules"
SET "rule_type" = 'EXACT_SCORE'
WHERE "rule_description" ILIKE '%exact%score%';

UPDATE "group_scoring_rules"
SET "rule_type" = 'CORRECT_WINNER'
WHERE "rule_description" ILIKE '%correct%winner%';

UPDATE "group_scoring_rules"
SET "rule_type" = 'CORRECT_DRAW'
WHERE "rule_description" ILIKE '%correct%draw%';

-- Set any remaining NULL values to EXACT_SCORE as default
UPDATE "group_scoring_rules"
SET "rule_type" = 'EXACT_SCORE'
WHERE "rule_type" IS NULL;

-- Make the column required
ALTER TABLE "group_scoring_rules" ALTER COLUMN "rule_type" SET NOT NULL;
