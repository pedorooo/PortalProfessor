import { z } from 'zod';

export const CreateEvaluationCriteriaSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters'),
  weight: z
    .number()
    .positive('Weight must be positive')
    .max(100, 'Weight must not exceed 100'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  evaluationId: z
    .number()
    .int('Evaluation ID must be an integer')
    .positive('Evaluation ID must be positive'),
});

export type CreateEvaluationCriteriaDto = z.infer<
  typeof CreateEvaluationCriteriaSchema
>;
