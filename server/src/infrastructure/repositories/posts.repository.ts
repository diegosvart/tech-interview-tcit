import { prisma } from '../prisma/client';
import type { Post } from '../../domain/entities';

export async function createPost(input: {
  name: string;
  description?: string | null;
}): Promise<Post> {
  const created = await prisma.post.create({
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });

  const post: Post = {
    id: created.id,
    name: created.name,
    description: created.description ?? null,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
  return post;
}
