import { z } from 'zod';

export const CreateEvaluationSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters'),
  classId: z
    .number()
    .int('Class ID must be an integer')
    .positive('Class ID must be positive'),
  dueDate: z.string().pipe(z.coerce.date()),
  status: z.enum(['OPEN', 'CLOSED']).default('OPEN').optional(),
});

export type CreateEvaluationDto = z.infer<typeof CreateEvaluationSchema>;
