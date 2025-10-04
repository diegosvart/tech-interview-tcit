import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, isDangerous = false }) {
    // Cerrar con tecla Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCancel]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onCancel, children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "modal-header", children: _jsx("h3", { className: "modal-title", children: title }) }), _jsx("div", { className: "modal-body", children: _jsx("p", { className: "modal-message", dangerouslySetInnerHTML: { __html: message } }) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn-modal btn-cancel", onClick: onCancel, children: cancelText }), _jsx("button", { type: "button", className: `btn-modal btn-confirm ${isDangerous ? 'btn-danger' : ''}`, onClick: onConfirm, children: confirmText })] })] }) }));
}
