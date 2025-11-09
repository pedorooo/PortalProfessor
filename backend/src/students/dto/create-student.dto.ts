import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CreateStudentSchema = z.object({
  email: z
    .string()
    .refine((val) => emailRegex.test(val), 'Invalid email format'),
  password: z
    .string()
    .pipe(z.string().min(8, 'Password must be at least 8 characters')),
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(255, 'Name is too long'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 10,
      'Phone must be at least 10 characters if provided',
    ),
  classId: z.number().int().positive().optional(),
});

export type CreateStudentDto = z.infer<typeof CreateStudentSchema>;
