import { z } from 'zod';

export const UpdateStudentSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(255, 'Name is too long')
    .optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 10,
      'Phone must be at least 10 characters if provided',
    ),
  status: z
    .enum(['ACTIVE', 'INACTIVE'], {
      message: 'Status must be either ACTIVE or INACTIVE',
    })
    .optional(),
});

export type UpdateStudentDto = z.infer<typeof UpdateStudentSchema>;
