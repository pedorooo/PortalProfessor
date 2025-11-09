import { z } from 'zod';

export const UpdateProfessorSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters')
    .optional(),
});

export type UpdateProfessorDto = z.infer<typeof UpdateProfessorSchema>;
