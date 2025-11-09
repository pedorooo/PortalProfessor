/*
  Warnings:

  - You are about to drop the column `criterionId` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the `EvaluationCriterion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EvaluationCriterion" DROP CONSTRAINT "EvaluationCriterion_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_criterionId_fkey";

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "gradeWeight" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "criterionId";

-- DropTable
DROP TABLE "EvaluationCriterion";
