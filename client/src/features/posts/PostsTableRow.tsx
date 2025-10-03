import { useState } from 'react';

import ConfirmModal from './ConfirmModal';
import { Post } from './posts.api';

interface PostsTableRowProps {
  post: Post;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string, description: string) => Promise<void>;
}

export default function PostsTableRow({ post, onDelete, onUpdate }: PostsTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(post.name);
  const [description, setDescription] = useState(post.description || '');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setName(post.name);
    setDescription(post.description || '');
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(post.name);
    setDescription(post.description || '');
    setError('');
  };

  const handleSave = () => {
    setError('');

    // Validaciones
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('El nombre es requerido');
      return;
    }

    if (trimmedName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (trimmedName.length > 200) {
      setError('El nombre no puede tener más de 200 caracteres');
      return;
    }

    if (description.length > 500) {
      setError('La descripción no puede tener más de 500 caracteres');
      return;
    }

    // Si no hay cambios, solo cerrar modo edición
    if (trimmedName === post.name && description.trim() === (post.description || '')) {
      setIsEditing(false);
      return;
    }

    // Abrir modal de confirmación
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    setShowSaveModal(false);
    setIsUpdating(true);
    
    const trimmedName = name.trim();
    
    try {
      await onUpdate(post.id, trimmedName, description.trim());
      setIsEditing(false);
    } catch (err) {
      setError('Error al actualizar el post');
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelSave = () => {
    setShowSaveModal(false);
  };

  return (
    <>
      {isEditing ? (
        <tr className="row-editing">
          <td className="cell-name">
            <input
              type="text"
              className={`input-inline ${error && error.includes('nombre') ? 'input-error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUpdating}
              maxLength={200}
              autoFocus
            />
            {error && error.includes('nombre') && (
              <span className="error-text-inline">{error}</span>
            )}
          </td>
          <td className="cell-description">
            <input
              type="text"
              className={`input-inline ${error && error.includes('descripción') ? 'input-error' : ''}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUpdating}
              maxLength={500}
              placeholder="Descripción (opcional)"
            />
            {error && error.includes('descripción') && (
              <span className="error-text-inline">{error}</span>
            )}
          </td>
          <td className="cell-action">
            <div className="btn-group-inline">
              <button
                type="button"
                className="btn-save"
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                className="btn-cancel-inline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancelar
              </button>
            </div>
          </td>
        </tr>
      ) : (
        <tr>
          <td className="cell-name">{post.name}</td>
          <td className="cell-description">{post.description || '-'}</td>
          <td className="cell-action">
            <div className="btn-group-inline">
              <button
                type="button"
                className="btn-edit"
                onClick={handleEdit}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={() => onDelete(post.id)}
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* Modal de confirmación para guardar cambios */}
      <ConfirmModal
        isOpen={showSaveModal}
        title="Guardar Cambios"
        message={`¿Está seguro que desea editar de forma permanente el post <strong>"${post.name}"</strong>?`}
        confirmText="Guardar"
        cancelText="Cancelar"
        onConfirm={confirmSave}
        onCancel={cancelSave}
        isDangerous={false}
      />
    </>
  );
}
