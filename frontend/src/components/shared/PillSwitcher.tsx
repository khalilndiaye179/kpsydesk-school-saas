import React from 'react';

interface PillSwitcherProps {
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
}

export const PillSwitcher: React.FC<PillSwitcherProps> = ({ options, activeOption, onChange }) => {
  return (
    <div style={{
      backgroundColor: 'var(--border)',
      padding: '4px',
      borderRadius: '30px',
      display: 'inline-flex',
      gap: '4px'
    }}>
      {options.map((opt) => {
        const isActive = opt === activeOption;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 200ms ease-out'
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};
