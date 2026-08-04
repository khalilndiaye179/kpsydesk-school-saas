import React from 'react';

export const GraduationIllustration: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', ...style }}
    >
      <defs>
        {/* Gradients pour les effets et ombres */}
        <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="100%" stopColor="#D4A853" />
        </linearGradient>
        <linearGradient id="grad-sn-green" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00A850" />
          <stop offset="100%" stopColor="#007034" />
        </linearGradient>
        <linearGradient id="grad-ci-orange" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF8800" />
          <stop offset="100%" stopColor="#D96600" />
        </linearGradient>
        <linearGradient id="grad-ml-yellow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFDC00" />
          <stop offset="100%" stopColor="#D9B800" />
        </linearGradient>
        <linearGradient id="grad-gown" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2A4B3C" />
          <stop offset="100%" stopColor="#1B3B2F" />
        </linearGradient>
        <filter id="drop-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1B3B2F" floodOpacity="0.25" />
        </filter>
        <filter id="cap-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* ARRIÈRE-PLAN : Vagues stylisées des 3 Drapeau UEMOA (Sénégal 🇸🇳, Côte d'Ivoire 🇨🇮, Mali 🇲🇱) */}
      <g filter="url(#drop-shadow)" opacity="0.85">
        {/* Banner 1 - Drapeau Sénégal (Vert, Jaune, Rouge + Étoile) */}
        <path d="M 40 280 Q 140 220 240 250 T 440 230 L 440 340 L 40 340 Z" fill="#F5F1E8" opacity="0.5" />
        <g transform="translate(60, 210) rotate(-6)">
          <rect x="0" y="0" width="40" height="75" fill="url(#grad-sn-green)" rx="4" />
          <rect x="40" y="0" width="40" height="75" fill="#FDEF42" rx="0" />
          <rect x="80" y="0" width="40" height="75" fill="#E31B23" rx="4" />
          {/* Étoile Sénégal */}
          <polygon points="60,30 63,38 71,38 64,43 67,51 60,46 53,51 56,43 49,38 57,38" fill="#00853F" />
        </g>

        {/* Banner 2 - Drapeau Côte d'Ivoire (Orange, Blanc, Vert) */}
        <g transform="translate(190, 195) rotate(4)">
          <rect x="0" y="0" width="38" height="75" fill="url(#grad-ci-orange)" rx="4" />
          <rect x="38" y="0" width="38" height="75" fill="#FFFFFF" rx="0" />
          <rect x="76" y="0" width="38" height="75" fill="#00853F" rx="4" />
        </g>

        {/* Banner 3 - Drapeau Mali (Vert, Jaune, Rouge) */}
        <g transform="translate(320, 205) rotate(-3)">
          <rect x="0" y="0" width="38" height="75" fill="url(#grad-sn-green)" rx="4" />
          <rect x="38" y="0" width="38" height="75" fill="url(#grad-ml-yellow)" rx="0" />
          <rect x="76" y="0" width="38" height="75" fill="#E31B23" rx="4" />
        </g>
      </g>

      {/* SILHOUETTES DE DIPLÔMÉS EN TOGES (Silhouettes Expressives & Réalistes) */}
      
      {/* Diplômé 1 (Gauche) - Bras levé tenant son diplôme */}
      <g filter="url(#drop-shadow)">
        {/* Tête */}
        <circle cx="120" cy="240" r="16" fill="#4A3427" />
        {/* Corps & Toge */}
        <path d="M 95 380 L 110 265 C 115 258, 125 258, 130 265 L 145 380 Z" fill="url(#grad-gown)" />
        {/* Écharpe de Graduation Dorée */}
        <path d="M 112 265 L 120 295 L 128 265" stroke="url(#grad-gold)" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Bras levé avec diplôme */}
        <path d="M 125 265 Q 140 220 150 200" stroke="#4A3427" strokeWidth="8" strokeLinecap="round" />
        {/* Rouleau du diplôme avec ruban rouge */}
        <g transform="translate(145, 185) rotate(-20)">
          <rect x="0" y="0" width="28" height="10" rx="3" fill="#FFFFFF" stroke="#D4A853" strokeWidth="1.5" />
          <rect x="11" y="0" width="6" height="10" fill="#E31B23" />
        </g>
      </g>

      {/* Diplômé 2 (Centre) - Deux bras levés en signe de victoire */}
      <g filter="url(#drop-shadow)">
        {/* Tête */}
        <circle cx="250" cy="220" r="18" fill="#3D291D" />
        {/* Corps & Toge */}
        <path d="M 218 380 L 236 248 C 242 240, 258 240, 264 248 L 282 380 Z" fill="url(#grad-gown)" />
        {/* Écharpe de Graduation Dorée */}
        <path d="M 240 248 L 250 285 L 260 248" stroke="url(#grad-gold)" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* Bras gauche et droit levés */}
        <path d="M 238 250 Q 215 200 205 180" stroke="#3D291D" strokeWidth="9" strokeLinecap="round" />
        <path d="M 262 250 Q 285 200 295 180" stroke="#3D291D" strokeWidth="9" strokeLinecap="round" />
      </g>

      {/* Diplômé 3 (Droite) - Silhouette de diplômée brandissant son diplôme */}
      <g filter="url(#drop-shadow)">
        {/* Tête */}
        <circle cx="370" cy="245" r="16" fill="#523B2B" />
        {/* Corps & Toge */}
        <path d="M 345 380 L 360 270 C 365 263, 375 263, 380 270 L 395 380 Z" fill="url(#grad-gown)" />
        {/* Écharpe Dorée */}
        <path d="M 362 270 L 370 298 L 378 270" stroke="url(#grad-gold)" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Bras droit levé tenant le diplôme */}
        <path d="M 365 270 Q 345 225 335 205" stroke="#523B2B" strokeWidth="8" strokeLinecap="round" />
        {/* Diplôme avec ruban rouge */}
        <g transform="translate(320, 190) rotate(15)">
          <rect x="0" y="0" width="28" height="10" rx="3" fill="#FFFFFF" stroke="#D4A853" strokeWidth="1.5" />
          <rect x="11" y="0" width="6" height="10" fill="#E31B23" />
        </g>
      </g>

      {/* TOQUES DE GRADUATION LANCÉES EN L'AIR & TRAJECTOIRES DE VOL */}
      <g filter="url(#cap-shadow)">
        {/* Lignes de mouvement / arcs de vol */}
        <path d="M 120 220 Q 110 140 130 90" stroke="#D4A853" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <path d="M 250 200 Q 250 110 265 50" stroke="#D4A853" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
        <path d="M 370 220 Q 390 130 380 75" stroke="#D4A853" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

        {/* Toque 1 (Gauche) */}
        <g transform="translate(115, 75) rotate(-18) scale(1.1)">
          <polygon points="20,5 40,15 20,25 0,15" fill="#1B3B2F" stroke="#D4A853" strokeWidth="1.2" />
          <rect x="14" y="20" width="12" height="7" fill="#1B3B2F" />
          {/* Pompom doré */}
          <path d="M 20 15 L 32 26" stroke="#D4A853" strokeWidth="1.5" />
          <circle cx="32" cy="27" r="2.5" fill="#F5D061" />
        </g>

        {/* Toque 2 (Centre - Plus haute) */}
        <g transform="translate(250, 40) rotate(12) scale(1.35)">
          <polygon points="20,5 40,15 20,25 0,15" fill="#1B3B2F" stroke="#FDEF42" strokeWidth="1.2" />
          <rect x="14" y="20" width="12" height="7" fill="#1B3B2F" />
          {/* Pompom doré */}
          <path d="M 20 15 L 33 26" stroke="#F5D061" strokeWidth="1.5" />
          <circle cx="33" cy="27" r="2.5" fill="#FDEF42" />
        </g>

        {/* Toque 3 (Droite) */}
        <g transform="translate(365, 60) rotate(-8) scale(1.15)">
          <polygon points="20,5 40,15 20,25 0,15" fill="#1B3B2F" stroke="#D4A853" strokeWidth="1.2" />
          <rect x="14" y="20" width="12" height="7" fill="#1B3B2F" />
          {/* Pompom doré */}
          <path d="M 20 15 L 31 26" stroke="#D4A853" strokeWidth="1.5" />
          <circle cx="31" cy="27" r="2.5" fill="#F5D061" />
        </g>
      </g>

      {/* ÉTINCELLES, ÉTOILES ET PARTICULES DE CÉLÉBRATION */}
      <g fill="#D4A853" opacity="0.85">
        <polygon points="170,110 173,117 180,117 174,122 176,129 170,124 164,129 166,122 160,117 167,117" />
        <polygon points="310,90 312,95 318,95 313,99 315,104 310,100 305,104 307,99 302,95 308,95" transform="scale(0.8) translate(80, 20)" />
        <polygon points="230,130 232,135 237,135 233,138 235,143 230,140 225,143 227,138 223,135 228,135" transform="scale(0.7) translate(100, 50)" />
        <circle cx="100" cy="160" r="3" fill="#FDEF42" />
        <circle cx="210" cy="80" r="2.5" fill="#FF8800" />
        <circle cx="390" cy="130" r="3.5" fill="#D4A853" />
        <circle cx="300" cy="170" r="2.5" fill="#00A850" />
      </g>
    </svg>
  );
};
