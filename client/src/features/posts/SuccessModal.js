import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
export default function SuccessModal({ isOpen, message, onClose, autoCloseDelay = 3000 }) {
    // Auto-cerrar después del delay
    useEffect(() => {
        if (!isOpen)
            return;
        const timer = setTimeout(() => {
            onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
    }, [isOpen, autoCloseDelay, onClose]);
    // Cerrar con ESC
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKeyDown = (e) => {
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
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-content success-modal", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "modal-header", children: _jsx("div", { className: "success-icon", children: "\u2713" }) }), _jsx("div", { className: "modal-body", children: _jsx("p", { dangerouslySetInnerHTML: { __html: message } }) }), _jsx("div", { className: "modal-footer", children: _jsx("button", { type: "button", className: "btn btn-primary", onClick: onClose, children: "Aceptar" }) })] }) }));
}
