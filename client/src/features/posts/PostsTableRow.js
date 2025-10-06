import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
export default function PostsTableRow({ post, onDelete, onUpdate }) {
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
        }
        catch {
            setError('Error al actualizar el post');
        }
        finally {
            setIsUpdating(false);
        }
    };
    const cancelSave = () => {
        setShowSaveModal(false);
    };
    return (_jsxs(_Fragment, { children: [isEditing ? (_jsxs("tr", { className: "row-editing", children: [_jsxs("td", { className: "cell-name", children: [_jsx("input", { type: "text", className: `input-inline ${error && error.includes('nombre') ? 'input-error' : ''}`, value: name, onChange: (e) => setName(e.target.value), disabled: isUpdating, maxLength: 200, autoFocus: true }), error && error.includes('nombre') && (_jsx("span", { className: "error-text-inline", children: error }))] }), _jsxs("td", { className: "cell-description", children: [_jsx("input", { type: "text", className: `input-inline ${error && error.includes('descripción') ? 'input-error' : ''}`, value: description, onChange: (e) => setDescription(e.target.value), disabled: isUpdating, maxLength: 500, placeholder: "Descripci\u00F3n (opcional)" }), error && error.includes('descripción') && (_jsx("span", { className: "error-text-inline", children: error }))] }), _jsx("td", { className: "cell-action", children: _jsxs("div", { className: "btn-group-inline", children: [_jsx("button", { type: "button", className: "btn-save", onClick: handleSave, disabled: isUpdating, children: isUpdating ? 'Guardando...' : 'Guardar' }), _jsx("button", { type: "button", className: "btn-cancel-inline", onClick: handleCancel, disabled: isUpdating, children: "Cancelar" })] }) })] })) : (_jsxs("tr", { children: [_jsx("td", { className: "cell-name", children: post.name }), _jsx("td", { className: "cell-description", children: post.description || '-' }), _jsx("td", { className: "cell-action", children: _jsxs("div", { className: "btn-group-inline", children: [_jsx("button", { type: "button", className: "btn-edit", onClick: handleEdit, children: "Editar" }), _jsx("button", { type: "button", className: "btn-delete", onClick: () => onDelete(post.id), children: "Eliminar" })] }) })] })), _jsx(ConfirmModal, { isOpen: showSaveModal, title: "Guardar Cambios", message: `¿Está seguro que desea editar de forma permanente el post <strong>"${post.name}"</strong>?`, confirmText: "Guardar", cancelText: "Cancelar", onConfirm: confirmSave, onCancel: cancelSave, isDangerous: false })] }));
}
