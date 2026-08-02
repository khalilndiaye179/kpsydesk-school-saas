import React from 'react';

interface ModalProps {
  onClose?: () => void;
  title?: string;
  /** Largeur maximale de la carte (défaut: 500px). */
  maxWidth?: string;
  /** Thème de la carte : clair (vues tenant) ou sombre (vues superadmin). */
  variant?: 'light' | 'dark';
  showCloseButton?: boolean;
  overlayStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  children: React.ReactNode;
}

const overlayBase: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 1000,
};

const cardBase: React.CSSProperties = {
  width: '100%',
  borderRadius: '24px',
  padding: '32px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

/** Overlay + carte centrée réutilisés par toutes les modales de l'application. */
export const Modal: React.FC<ModalProps> = ({
  onClose,
  title,
  maxWidth = '500px',
  variant = 'light',
  showCloseButton = true,
  overlayStyle,
  contentStyle,
  children,
}) => {
  const theme: React.CSSProperties =
    variant === 'dark'
      ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white' }
      : { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' };

  return (
    <div style={{ ...overlayBase, ...overlayStyle }}>
      <div style={{ ...cardBase, ...theme, maxWidth, ...contentStyle }}>
        {(title || (showCloseButton && onClose)) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              gap: '16px',
            }}
          >
            {title && (
              <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.4rem' }}>
                {title}
              </h3>
            )}
            {showCloseButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  color: variant === 'dark' ? '#94a3b8' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
