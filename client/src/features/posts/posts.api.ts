import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Post {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  name: string;
  description?: string;
}

export interface UpdatePostInput {
  name?: string;
  description?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface PostsResponse {
  data: Post[];
  pagination?: PaginationInfo;
}

// Determinar base URL respetando variable de entorno, pero evitando exponer host interno 'server' al navegador.
function resolveBaseUrl() {
  const envUrl: string | undefined = (import.meta as any).env?.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') return '/api/v1';
  try {
    const u = new URL(envUrl);
    // Si el hostname es 'server' (nombre interno Docker) devolver ruta relativa para que el proxy de Vite actúe.
    if (u.hostname === 'server') {
      return u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname; // normalmente /api/v1
    }
    // Normalizar quitando slash final
    return envUrl.replace(/\/$/, '');
  } catch {
    // Si no es una URL válida, asumir que es una ruta relativa ya (e.g. /api/v1)
    return envUrl.startsWith('/') ? envUrl.replace(/\/$/, '') : `/${envUrl.replace(/\/$/, '')}`;
  }
}

const baseUrl = resolveBaseUrl();

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    listPosts: builder.query<PostsResponse, { page?: number; pageSize?: number }>({
      query: (params = {}) => ({ 
        url: '/posts', 
        params: params 
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: 'Posts' as const, id: p.id })),
              { type: 'Posts' as const, id: 'LIST' },
            ]
          : [{ type: 'Posts' as const, id: 'LIST' }],
    }),
    getPost: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Posts', id }],
    }),
    createPost: builder.mutation<Post, CreatePostInput>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
    updatePost: builder.mutation<Post, { id: string; data: UpdatePostInput }>({
      query: ({ id, data }) => ({ url: `/posts/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Posts', id },
        { type: 'Posts', id: 'LIST' },
      ],
    }),
    deletePost: builder.mutation<void, string>({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
  }),
});

export const { 
  useListPostsQuery, 
  useGetPostQuery, 
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation
} = postsApi;
