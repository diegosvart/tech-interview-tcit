import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import FilterHeader from './FilterHeader';
import PostFormInline from './PostFormInline';
import { useListPostsQuery, useCreatePostMutation, useDeletePostMutation, useUpdatePostMutation } from './posts.api';
import PostsTable from './PostsTable';
import SuccessModal from './SuccessModal';
export default function PostsList() {
    // Estado local para el filtro
    const [filter, setFilter] = useState('');
    // Estado de paginación
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    // Estado del modal de confirmación
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    // Estado del modal de éxito
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    // RTK Query hooks con parámetros de paginación
    const { data, isLoading, isError } = useListPostsQuery({ page, pageSize });
    const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
    const [deletePost] = useDeletePostMutation();
    const [updatePost] = useUpdatePostMutation();
    // Obtener info de paginación del backend, o usar valores del estado local
    const dataLength = data?.data?.length || 0;
    const pagination = data?.pagination
        ? {
            page: data.pagination.page,
            pageSize: data.pagination.pageSize,
            total: data.pagination.total,
            hasNextPage: data.pagination.hasNextPage,
            // Calcular totalPages desde total y pageSize
            totalPages: Math.ceil(data.pagination.total / data.pagination.pageSize)
        }
        : {
            page: page,
            pageSize: pageSize,
            total: dataLength,
            hasNextPage: false,
            totalPages: dataLength > 0 ? Math.ceil(dataLength / pageSize) : 1
        };
    // Filtrado local de posts por nombre (sobre la página actual)
    const filteredPosts = useMemo(() => {
        if (!data?.data)
            return [];
        if (!filter.trim())
            return data.data;
        return data.data.filter((post) => post.name.toLowerCase().includes(filter.toLowerCase()));
    }, [data, filter]);
    // Handler para crear nuevo post
    const handleCreate = async (name, description) => {
        await createPost({
            name,
            description: description || undefined
        }).unwrap();
        // Volver a la primera página después de crear
        setPage(1);
    };
    // Handler para éxito en creación
    const handleCreateSuccess = (name) => {
        setSuccessMessage(`El post <strong>"${name}"</strong> ha sido creado.`);
        setSuccessModalOpen(true);
    };
    // Handler para abrir modal de confirmación
    const handleDelete = (id) => {
        const post = filteredPosts.find(p => p.id === id);
        if (post) {
            setPostToDelete({ id: post.id, name: post.name });
            setDeleteModalOpen(true);
        }
    };
    // Handler para confirmar eliminación
    const confirmDelete = async () => {
        if (!postToDelete)
            return;
        try {
            await deletePost(postToDelete.id).unwrap();
            // Si estamos en una página vacía después de eliminar, volver a la anterior
            if (filteredPosts.length === 1 && page > 1) {
                setPage(page - 1);
            }
            // Cerrar modal de confirmación
            setDeleteModalOpen(false);
            setPostToDelete(null);
            // Mostrar modal de éxito
            setSuccessMessage(`El post <strong>"${postToDelete.name}"</strong> ha sido eliminado.`);
            setSuccessModalOpen(true);
        }
        catch (error) {
            console.error('Error al eliminar post:', error);
            alert('Error al eliminar el post. Intente nuevamente.');
            setDeleteModalOpen(false);
            setPostToDelete(null);
        }
    };
    // Handler para cancelar eliminación
    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setPostToDelete(null);
    };
    // Handler para actualizar post
    const handleUpdate = async (id, name, description) => {
        await updatePost({
            id,
            data: {
                name,
                description: description || undefined
            }
        }).unwrap();
        // Mostrar modal de éxito
        setSuccessMessage(`El post <strong>"${name}"</strong> ha sido actualizado.`);
        setSuccessModalOpen(true);
    };
    // Handlers de paginación
    const handlePageChange = (newPage) => {
        setPage(newPage);
        setFilter(''); // Limpiar filtro al cambiar de página
    };
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1); // Volver a la primera página al cambiar el tamaño
        setFilter(''); // Limpiar filtro
    };
    if (isError) {
        return (_jsx("div", { className: "posts-container", children: _jsx("p", { className: "error-message", children: "Error al cargar los posts. Intente nuevamente." }) }));
    }
    return (_jsxs("div", { className: "posts-container", children: [_jsxs("section", { className: "create-post-section", children: [_jsx("h2", { className: "section-title", children: "Agregar Post" }), _jsx(PostFormInline, { onCreate: handleCreate, isLoading: isCreating, onSuccess: handleCreateSuccess })] }), _jsx("div", { className: "section-divider" }), _jsx(FilterHeader, { filter: filter, onFilterChange: setFilter, currentPage: page, pageSize: pageSize, totalPages: pagination.totalPages, onPageChange: handlePageChange, onPageSizeChange: handlePageSizeChange }), _jsx(PostsTable, { posts: filteredPosts, onDelete: handleDelete, onUpdate: handleUpdate, isLoading: isLoading }), _jsx(ConfirmModal, { isOpen: deleteModalOpen, title: "Eliminar Post", message: postToDelete
                    ? `¿Está seguro de que desea eliminar el post <strong>"${postToDelete.name}"</strong>? Esta acción no se puede deshacer.`
                    : "¿Está seguro de que desea eliminar este post? Esta acción no se puede deshacer.", confirmText: "Eliminar", cancelText: "Cancelar", onConfirm: confirmDelete, onCancel: cancelDelete, isDangerous: true }), _jsx(SuccessModal, { isOpen: successModalOpen, message: successMessage, onClose: () => setSuccessModalOpen(false), autoCloseDelay: 3000 })] }));
}
