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

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    listPosts: builder.query<PostsResponse, { page?: number; pageSize?: number } | void>({
      query: (params) => ({ url: '/posts', params: params ?? {} as Record<string, any> }),
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
