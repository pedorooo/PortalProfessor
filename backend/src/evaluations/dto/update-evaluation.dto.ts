import { z } from 'zod';

export const UpdateEvaluationSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters')
    .optional(),
  dueDate: z.string().pipe(z.coerce.date()).optional(),
  gradeWeight: z
    .number()
    .min(0, 'Grade weight must be at least 0')
    .max(100, 'Grade weight must not exceed 100')
    .optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
});

export type UpdateEvaluationDto = z.infer<typeof UpdateEvaluationSchema>;
