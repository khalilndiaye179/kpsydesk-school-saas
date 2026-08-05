/**
 * Tokens de design officiels KPSyDesk School — Référence Visuelle Maquette v2
 */

export const designTokens = {
  colors: {
    // Fond Panneau Branding (Dégradé vert nuit sombre -> noir)
    bgBrandingGradient: 'linear-gradient(180deg, #051C14 0%, #020B08 100%)',
    bgBrandingPanel: '#051C14',
    bgBrandingDark: '#020B08',

    // Accents Marque KPSyDesk
    brandGold: '#D4A853',
    brandAmber: '#F59E0B',
    brandEmerald: '#0D3A2A',
    brandMint: '#10B981',

    // CTA & Actions
    ctaRed: '#DC2626',
    ctaRedHover: '#EF4444',

    // Surfaces Auth & Cartes
    surfaceDark: '#0F172A',
    surfaceInput: '#1E293B',
    borderDark: 'rgba(255, 255, 255, 0.1)',

    // Typographie & Textes
    textWhite: '#FFFFFF',
    textMuted: '#94A3B8',
    textDim: '#64748B',
  },
  typography: {
    fontTitle: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  shadows: {
    glowGold: '0 0 25px rgba(212, 168, 83, 0.25)',
    glowRed: '0 4px 20px rgba(220, 38, 38, 0.4)',
    cardShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  },
  borderRadius: {
    pill: '9999px',
    card: '16px',
    input: '12px',
  },
};
