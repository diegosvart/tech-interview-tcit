import type { Post } from '../../domain/entities';
import { prisma } from '../prisma/client';

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

export async function listPosts(input: { page: number; pageSize: number }): Promise<{ data: Post[]; pagination: { page: number; pageSize: number; total: number; hasNextPage: boolean } }> {
  const { page, pageSize } = input;
  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count(),
  ]);

  const data: Post[] = rows.map((r: { id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date }) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const hasNextPage = skip + rows.length < total;
  return { data, pagination: { page, pageSize, total, hasNextPage } };
}

export async function getPostById(id: string): Promise<Post | null> {
  const r = await prisma.post.findUnique({ where: { id } });
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  } satisfies Post;
}

export async function updatePost(id: string, data: { name?: string; description?: string | null }): Promise<Post> {
  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
  });
  return {
    id: updated.id,
    name: updated.name,
    description: updated.description ?? null,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  } satisfies Post;
}

export async function deletePost(id: string): Promise<void> {
  await prisma.post.delete({ where: { id } });
}
