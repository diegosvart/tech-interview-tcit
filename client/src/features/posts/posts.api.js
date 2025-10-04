import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// Determinar base URL respetando variable de entorno, pero evitando exponer host interno 'server' al navegador.
function resolveBaseUrl() {
    const envUrl = import.meta.env?.VITE_API_URL;
    if (!envUrl || envUrl.trim() === '')
        return '/api/v1';
    try {
        const u = new URL(envUrl);
        // Si el hostname es 'server' (nombre interno Docker) devolver ruta relativa para que el proxy de Vite actúe.
        if (u.hostname === 'server') {
            return u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname; // normalmente /api/v1
        }
        // Normalizar quitando slash final
        return envUrl.replace(/\/$/, '');
    }
    catch {
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
        listPosts: builder.query({
            query: (params = {}) => ({
                url: '/posts',
                params: params
            }),
            providesTags: (result) => result?.data
                ? [
                    ...result.data.map((p) => ({ type: 'Posts', id: p.id })),
                    { type: 'Posts', id: 'LIST' },
                ]
                : [{ type: 'Posts', id: 'LIST' }],
        }),
        getPost: builder.query({
            query: (id) => `/posts/${id}`,
            providesTags: (_res, _err, id) => [{ type: 'Posts', id }],
        }),
        createPost: builder.mutation({
            query: (body) => ({ url: '/posts', method: 'POST', body }),
            invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
        }),
        updatePost: builder.mutation({
            query: ({ id, data }) => ({ url: `/posts/${id}`, method: 'PUT', body: data }),
            invalidatesTags: (_res, _err, { id }) => [
                { type: 'Posts', id },
                { type: 'Posts', id: 'LIST' },
            ],
        }),
        deletePost: builder.mutation({
            query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
        }),
    }),
});
export const { useListPostsQuery, useGetPostQuery, useCreatePostMutation, useUpdatePostMutation, useDeletePostMutation } = postsApi;
