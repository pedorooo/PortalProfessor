import { z } from 'zod';

export const UpdateEvaluationCriteriaSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters')
    .optional(),
  weight: z
    .number()
    .positive('Weight must be positive')
    .max(100, 'Weight must not exceed 100')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
});

export type UpdateEvaluationCriteriaDto = z.infer<
  typeof UpdateEvaluationCriteriaSchema
>;
