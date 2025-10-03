import { useMemo, useState } from 'react';
import { useListPostsQuery, useCreatePostMutation, useDeletePostMutation, useUpdatePostMutation } from './posts.api';
import FilterHeader from './FilterHeader';
import PostsTable from './PostsTable';
import PostFormInline from './PostFormInline';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';

export default function PostsList() {
  // Estado local para el filtro
  const [filter, setFilter] = useState('');
  
  // Estado de paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Estado del modal de confirmación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{ id: string; name: string } | null>(null);
  
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
    if (!data?.data) return [];
    if (!filter.trim()) return data.data;
    
    return data.data.filter((post) =>
      post.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  // Handler para crear nuevo post
  const handleCreate = async (name: string, description: string): Promise<void> => {
    await createPost({ 
      name, 
      description: description || undefined 
    }).unwrap();
    // Volver a la primera página después de crear
    setPage(1);
  };

  // Handler para éxito en creación
  const handleCreateSuccess = (name: string) => {
    setSuccessMessage(`El post <strong>"${name}"</strong> ha sido creado.`);
    setSuccessModalOpen(true);
  };

  // Handler para abrir modal de confirmación
  const handleDelete = (id: string) => {
    const post = filteredPosts.find(p => p.id === id);
    if (post) {
      setPostToDelete({ id: post.id, name: post.name });
      setDeleteModalOpen(true);
    }
  };

  // Handler para confirmar eliminación
  const confirmDelete = async () => {
    if (!postToDelete) return;

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
    } catch (error) {
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
  const handleUpdate = async (id: string, name: string, description: string): Promise<void> => {
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
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setFilter(''); // Limpiar filtro al cambiar de página
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Volver a la primera página al cambiar el tamaño
    setFilter(''); // Limpiar filtro
  };

  if (isError) {
    return (
      <div className="posts-container">
        <p className="error-message">Error al cargar los posts. Intente nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="posts-container">
      {/* Header: Formulario de crear post */}
      <section className="create-post-section">
        <h2 className="section-title">Agregar Post</h2>
        <PostFormInline 
          onCreate={handleCreate}
          isLoading={isCreating}
          onSuccess={handleCreateSuccess}
        />
      </section>

      {/* Separador */}
      <div className="section-divider"></div>
      
      {/* Filtro y paginación */}
      <FilterHeader 
        filter={filter} 
        onFilterChange={setFilter}
        currentPage={page}
        pageSize={pageSize}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      
      {/* Grilla de posts */}
      <PostsTable 
        posts={filteredPosts} 
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        isLoading={isLoading}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Eliminar Post"
        message={
          postToDelete 
            ? `¿Está seguro de que desea eliminar el post <strong>"${postToDelete.name}"</strong>? Esta acción no se puede deshacer.`
            : "¿Está seguro de que desea eliminar este post? Esta acción no se puede deshacer."
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalOpen}
        message={successMessage}
        onClose={() => setSuccessModalOpen(false)}
        autoCloseDelay={3000}
      />
    </div>
  );
}
