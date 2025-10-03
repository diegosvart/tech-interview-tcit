import { Request, Response, NextFunction } from 'express';
import { createPostService } from '../../../application/services';
import type { PostCreateDTO } from '../../../domain/dtos';

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const body = (res.locals as any).body as PostCreateDTO;
    const created = await createPostService(body);
    res.status(201).location(`/api/v1/posts/${created.id}`).json(created);
  } catch (err) {
    return next(err);
  }
}
