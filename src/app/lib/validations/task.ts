import { z } from 'zod';

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']);
export const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  projectId: z.string().uuid('Invalid project ID format').optional().nullable(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  dueDate: z.string().datetime({ message: 'Invalid datetime format' }).optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  projectId: z.string().uuid('Invalid project ID format').optional().nullable(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  dueDate: z.string().datetime({ message: 'Invalid datetime format' }).optional().nullable(),
});
