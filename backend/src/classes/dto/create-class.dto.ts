import { z } from 'zod';

const ClassScheduleSchema = z.object({
  dayOfWeek: z.string().min(1, 'Day of week is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

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
  schedule: z
    .array(ClassScheduleSchema)
    .min(1, 'At least one schedule is required'),
});

export type CreateClassDto = z.infer<typeof CreateClassSchema>;
