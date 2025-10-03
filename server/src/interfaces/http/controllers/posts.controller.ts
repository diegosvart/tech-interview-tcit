import { Request, Response, NextFunction } from 'express';
import { createPostService, listPostsService, getPostByIdService, updatePostService, deletePostService } from '../../../application/services';
import type { PostCreateDTO, PostListQueryDTO, PostIdParamDTO, PostUpdateDTO } from '../../../domain/dtos';

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const body = (res.locals as any).body as PostCreateDTO;
    const created = await createPostService(body);
    res.status(201).location(`/api/v1/posts/${created.id}`).json(created);
  } catch (err) {
    return next(err);
  }
}

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals as any).query as PostListQueryDTO;
    const result = await listPostsService(query);
    res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const params = (res.locals as any).params as PostIdParamDTO;
    const post = await getPostByIdService(params.id);
    res.status(200).json(post);
  } catch (err) {
    return next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const params = (res.locals as any).params as PostIdParamDTO;
    const body = (res.locals as any).body as PostUpdateDTO;
    const updated = await updatePostService(params.id, body);
    res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const params = (res.locals as any).params as PostIdParamDTO;
    await deletePostService(params.id);
    res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
