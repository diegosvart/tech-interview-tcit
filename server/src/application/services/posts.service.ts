import type { PostCreateDTO, PostListQueryDTO, PostUpdateDTO } from '../../domain/dtos';
import { createPost as createPostRepo, listPosts as listPostsRepo, getPostById as getPostByIdRepo, updatePost as updatePostRepo, deletePost as deletePostRepo } from '../../infrastructure/repositories';

export async function createPostService(input: PostCreateDTO) {
  const created = await createPostRepo({
    name: input.name,
    description: input.description ?? null,
  });
  return created;
}

export async function listPostsService(q: PostListQueryDTO) {
  return listPostsRepo({ page: q.page, pageSize: q.pageSize });
}

export async function getPostByIdService(id: string) {
  const found = await getPostByIdRepo(id);
  if (!found) {
    const err: any = new Error('Post not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return found;
}

export async function updatePostService(id: string, dto: PostUpdateDTO) {
  // Ensure exists first
  const exists = await getPostByIdRepo(id);
  if (!exists) {
    const err: any = new Error('Post not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  const patch: { name?: string; description?: string | null } = {};
  if (dto.name !== undefined) patch.name = dto.name;
  if (dto.description !== undefined) patch.description = dto.description ?? null;
  return updatePostRepo(id, patch);
}

export async function deletePostService(id: string) {
  const exists = await getPostByIdRepo(id);
  if (!exists) {
    const err: any = new Error('Post not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  await deletePostRepo(id);
}
