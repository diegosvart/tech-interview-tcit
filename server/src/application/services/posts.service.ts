import type { PostCreateDTO } from '../../domain/dtos';
import { createPost as createPostRepo } from '../../infrastructure/repositories';

export async function createPostService(input: PostCreateDTO) {
  const created = await createPostRepo({
    name: input.name,
    description: input.description ?? null,
  });
  return created;
}
