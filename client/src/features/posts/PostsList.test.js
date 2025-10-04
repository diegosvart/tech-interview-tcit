import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PostsList from './PostsList';
// Mock de RTK Query hooks usados en el componente
vi.mock('./posts.api', () => ({
    useListPostsQuery: () => ({ data: { data: [], pagination: { page: 1, pageSize: 10, total: 0, hasNextPage: false } }, isLoading: false, isError: false }),
    useCreatePostMutation: () => [vi.fn(), { isLoading: false }],
    useDeletePostMutation: () => [vi.fn()],
    useUpdatePostMutation: () => [vi.fn()]
}));
describe('PostsList', () => {
    it('renderiza encabezado de creación', () => {
        render(_jsx(PostsList, {}));
        expect(screen.getByText(/Agregar Post/i)).toBeTruthy();
    });
});
