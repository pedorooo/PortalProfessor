import { z } from 'zod';

export const CreateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(255),
  subject: z.string().min(1, 'Subject is required').max(255),
  description: z.string().max(1000).optional(),
  maxCapacity: z
    .number()
    .int()
    .positive('Max capacity must be a positive number'),
  professorId: z
    .number()
    .int()
    .positive('Professor ID must be a positive number'),
});

export type CreateClassDto = z.infer<typeof CreateClassSchema>;
