import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['PROFESSOR', 'ADMIN', 'STUDENT']).optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
