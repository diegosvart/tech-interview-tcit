import { z } from 'zod';

// DTOs aligned with entity attributes: name/description
export const PostCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
});

export type PostCreateDTO = z.infer<typeof PostCreateSchema>;

export const PostUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type PostUpdateDTO = z.infer<typeof PostUpdateSchema>;

// Query params for list (pagination by offset)
export const PostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
export type PostListQueryDTO = z.infer<typeof PostListQuerySchema>;

// Path param for id
export const PostIdParamSchema = z.object({ id: z.string().uuid() });
export type PostIdParamDTO = z.infer<typeof PostIdParamSchema>;
