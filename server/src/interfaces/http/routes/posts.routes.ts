import { Router } from 'express';

import { PostCreateSchema, PostListQuerySchema, PostIdParamSchema, PostUpdateSchema } from '../../../domain/dtos';
import { createPost, listPosts, getPost, updatePost, deletePost } from '../controllers/posts.controller';
import { validateBody, validateQuery, validateParams } from '../middlewares';

const postsRouter = Router();

// POST /api/v1/posts
postsRouter.post('/posts', validateBody(PostCreateSchema), createPost);

// GET /api/v1/posts
postsRouter.get('/posts', validateQuery(PostListQuerySchema), listPosts);

// GET /api/v1/posts/:id
postsRouter.get('/posts/:id', validateParams(PostIdParamSchema), getPost);

// PUT /api/v1/posts/:id
postsRouter.put('/posts/:id', validateParams(PostIdParamSchema), validateBody(PostUpdateSchema), updatePost);

// DELETE /api/v1/posts/:id
postsRouter.delete('/posts/:id', validateParams(PostIdParamSchema), deletePost);

export default postsRouter;
