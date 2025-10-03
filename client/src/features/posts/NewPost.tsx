import { FormEvent, useState } from 'react';
import { useCreatePostMutation } from './posts.api';

export default function NewPost() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createPost, { isLoading, isSuccess, error } ] = useCreatePostMutation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createPost({ name, description: description || undefined }).unwrap();
    setName('');
    setDescription('');
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <h2>Nuevo Post</h2>
      <label>
        Nombre
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Descripción
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={isLoading}>Crear</button>
        {isSuccess && <span style={{ color: 'green' }}>Creado</span>}
        {error && <span style={{ color: 'crimson' }}>Error</span>}
      </div>
    </form>
  );
}
