import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function PostFormInline({ onCreate, isLoading, onSuccess }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
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
        try {
            await onCreate(trimmedName, description.trim());
            // Limpiar formulario después de crear
            const createdName = trimmedName;
            setName('');
            setDescription('');
            // Llamar callback de éxito con el nombre del post creado
            onSuccess?.(createdName);
        }
        catch {
            setError('Error al crear el post. Intente nuevamente.');
        }
    };
    return (_jsxs("div", { className: "post-form-wrapper", children: [_jsxs("form", { onSubmit: handleSubmit, className: "post-form-inline", children: [_jsx("input", { type: "text", className: "form-input", placeholder: "Nombre (m\u00EDn. 3 caracteres, m\u00E1x. 200)", value: name, onChange: (e) => setName(e.target.value), required: true, disabled: isLoading, maxLength: 200 }), _jsx("input", { type: "text", className: "form-input", placeholder: "Descripci\u00F3n (opcional)", value: description, onChange: (e) => setDescription(e.target.value), disabled: isLoading, maxLength: 500 }), _jsx("button", { type: "submit", className: "btn-create", disabled: isLoading || !name.trim(), children: isLoading ? 'Creando...' : 'Crear' })] }), error && (_jsx("div", { className: "form-error-message", children: error }))] }));
}
