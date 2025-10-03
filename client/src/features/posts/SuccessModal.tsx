import { useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  autoCloseDelay?: number; // ms, por defecto 3000
}

export default function SuccessModal({ 
  isOpen, 
  message, 
  onClose,
  autoCloseDelay = 3000 
}: SuccessModalProps) {
  // Auto-cerrar después del delay
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [isOpen, autoCloseDelay, onClose]);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content success-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="success-icon">✓</div>
        </div>
        <div className="modal-body">
          <p dangerouslySetInnerHTML={{ __html: message }} />
        </div>
        <div className="modal-footer">
          <button 
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
