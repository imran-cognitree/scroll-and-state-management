import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** If provided, renders a footer with Cancel + primary action button */
  actions?: {
    confirm: {
      label: string;
      variant?: 'danger' | 'primary';
      disabled?: boolean;
      onClick: () => void;
    };
    cancel?: {
      label?: string;
    };
  };
}

export function Modal({ isOpen, title, onClose, children, actions }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Focus trap — focus the dialog on open
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmVariant = actions?.confirm.variant ?? 'primary';

  return (
    <div className="modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="modal"
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__title" id="modal-title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">{children}</div>

        {/* Footer */}
        {actions && (
          <div className="modal__footer">
            <button
              className="modal__btn modal__btn--cancel"
              onClick={onClose}
            >
              {actions.cancel?.label ?? 'Cancel'}
            </button>
            <button
              className={`modal__btn modal__btn--confirm modal__btn--${confirmVariant}`}
              onClick={actions.confirm.onClick}
              disabled={actions.confirm.disabled}
            >
              {actions.confirm.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
