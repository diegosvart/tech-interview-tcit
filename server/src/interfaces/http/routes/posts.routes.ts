import { Router } from 'express';
import { createPost } from '../controllers/posts.controller';
import { validateBody } from '../middlewares';
import { PostCreateSchema } from '../../../domain/dtos';

const postsRouter = Router();

// POST /api/v1/posts
postsRouter.post('/posts', validateBody(PostCreateSchema), createPost);

export default postsRouter;
