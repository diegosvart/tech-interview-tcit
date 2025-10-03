import { FormEvent, useState } from 'react';

interface PostFormInlineProps {
  onCreate: (name: string, description: string) => Promise<void>;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export default function PostFormInline({ onCreate, isLoading, onSuccess }: PostFormInlineProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSuccess(false);

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
      setName('');
      setDescription('');
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      onSuccess?.();
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Error al crear el post. Intente nuevamente.');
    }
  };

  return (
    <div className="post-form-wrapper">
      <form onSubmit={handleSubmit} className="post-form-inline">
        <input
          type="text"
          className="form-input"
          placeholder="Nombre (mín. 3 caracteres, máx. 200)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          maxLength={200}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          maxLength={500}
        />
        <button
          type="submit"
          className="btn-create"
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? 'Creando...' : 'Crear'}
        </button>
      </form>
      
      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="success-message">
          ✓ Post creado exitosamente
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="form-error-message">
          {error}
        </div>
      )}
    </div>
  );
}
