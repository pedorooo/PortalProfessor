import { z } from 'zod';

export const UpdateProfileSchema = z
  .object({
    name: z.string().min(1, 'Name must not be empty').optional(),
    phone: z.string().min(1, 'Phone must not be empty').optional(),
  })
  .strict()
  .default({});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
