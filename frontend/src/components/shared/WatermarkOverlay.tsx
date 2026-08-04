import React from 'react';

interface WatermarkOverlayProps {
  opacity?: number;
  color?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ 
  opacity = 0.04, 
  color = '#D4A853' 
}) => {
  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: opacity,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '60px'
      }}
    >
      {/* Pattern SVG Toque Académique Stylisée & Motifs de Fond */}
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 800 600" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <g stroke={color} strokeWidth="1.5" strokeDasharray="4 4">
          <circle cx="200" cy="150" r="120" />
          <circle cx="650" cy="450" r="160" />
          <polygon points="400,100 480,220 320,220" />
          <polygon points="150,420 250,520 50,520" />
        </g>
        
        {/* Filigrane Toque de Graduation Central */}
        <g transform="translate(300, 180) scale(4)" stroke={color} strokeWidth="1.2" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={color} fillOpacity="0.2" />
          <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="22" y1="7" x2="22" y2="15" strokeLinecap="round" />
          <circle cx="22" cy="16" r="1.5" fill={color} />
        </g>
      </svg>
    </div>
  );
};
