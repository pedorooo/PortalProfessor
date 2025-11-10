import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CreateProfessorSchema = z.object({
  email: z
    .string()
    .refine((val) => emailRegex.test(val), 'Invalid email format'),
  password: z
    .string()
    .pipe(z.string().min(8, 'Password must be at least 8 characters')),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters'),
});

export type CreateProfessorDto = z.infer<typeof CreateProfessorSchema>;
