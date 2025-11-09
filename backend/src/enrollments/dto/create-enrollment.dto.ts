import { z } from 'zod';

export const CreateEnrollmentSchema = z.object({
  studentId: z
    .number()
    .int('Student ID must be an integer')
    .positive('Student ID must be positive'),
  classId: z
    .number()
    .int('Class ID must be an integer')
    .positive('Class ID must be positive'),
  status: z
    .enum(['ACTIVE', 'COMPLETED', 'CANCELED'])
    .default('ACTIVE')
    .optional(),
});

export type CreateEnrollmentDto = z.infer<typeof CreateEnrollmentSchema>;
