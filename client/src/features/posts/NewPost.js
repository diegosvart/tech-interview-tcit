import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useCreatePostMutation } from './posts.api';
export default function NewPost() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [createPost, { isLoading, isSuccess, error }] = useCreatePostMutation();
    async function onSubmit(e) {
        e.preventDefault();
        if (!name.trim())
            return;
        await createPost({ name, description: description || undefined }).unwrap();
        setName('');
        setDescription('');
    }
    return (_jsxs("form", { onSubmit: onSubmit, style: { display: 'grid', gap: 12, maxWidth: 420 }, children: [_jsx("h2", { children: "Nuevo Post" }), _jsxs("label", { children: ["Nombre", _jsx("input", { value: name, onChange: (e) => setName(e.target.value), required: true })] }), _jsxs("label", { children: ["Descripci\u00F3n", _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value) })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { type: "submit", disabled: isLoading, children: "Crear" }), isSuccess && _jsx("span", { style: { color: 'green' }, children: "Creado" }), error && _jsx("span", { style: { color: 'crimson' }, children: "Error" })] })] }));
}
