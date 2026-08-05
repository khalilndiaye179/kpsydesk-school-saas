import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Mail, Phone, Bus, GraduationCap, Calendar, Users, 
  AlertTriangle, FileText, CheckCircle2, Sparkles, HelpCircle, Lock
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { PasswordStep } from './PasswordStep';
import { OtpStep } from './OtpStep';
import { GraduationIllustration } from '../components/shared/GraduationIllustration';
import { designTokens } from '../theme/designTokens';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ÉTATS DE SÉCURITÉ ET SÉQUENCE DE CONNEXION
  const [role, setRole] = useState<'DIRECTOR' | 'PROFESSEUR' | 'ADMINISTRATEUR'>('DIRECTOR');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Étape 1A : Redirection automatique si le serveur exige l'enrôlement MFA initial
  const handleRequireEnrollment = (enrollToken: string, email: string) => {
    navigate(`/mfa-enrollment?enroll_token=${enrollToken}&email=${encodeURIComponent(email)}`);
  };

  // Étape 1B Réussie : Réception du challenge_id du serveur -> Passage à l'Étape 2 (OtpStep)
  const handlePasswordSuccess = (newChallengeId: string, email: string) => {
    setChallengeId(newChallengeId);
    setUserEmail(email);
  };

  // Étape 1C Réussie (Direct login sans OTP) : Création directe de la session
  const handleDirectLoginSuccess = (userData: any) => {
    login(userData);
    if (userData.role === 'SUPER_ADMIN') {
      navigate('/superadmin');
    } else {
      navigate('/tenant');
    }
  };

  // Étape 2 Réussie : Validation de l'OTP et création de la session complète
  const handleOtpVerifySuccess = (userData: any) => {
    login(userData);
    if (userData.role === 'SUPER_ADMIN') {
      navigate('/superadmin');
    } else {
      navigate('/tenant');
    }
  };

  // Annulation / Réinitialisation du Challenge OTP -> Retour strict à l'Étape 1
  const handleResetToPasswordStep = () => {
    setChallengeId(null);
  };

  // Modules flottants positionnés autour de l'illustration
  const floatingModules = [
    { icon: GraduationCap, label: 'Structure Pédagogique', top: '10%', left: '8%' },
    { icon: Shield, label: 'Ressources Humaines', top: '18%', right: '6%' },
    { icon: Calendar, label: 'Emploi du temps', top: '48%', left: '6%' },
    { icon: Bus, label: 'Transport Scolaire', top: '42%', right: '8%' },
    { icon: Users, label: 'Élèves & Inscriptions', top: '75%', left: '10%' },
    { icon: FileText, label: 'Pointage Kiosque', top: '78%', right: '10%' },
  ];

  // Points forts du produit affichés sur le panneau branding
  const featurePoints = [
    'Gestion 360° : Élèves, Enseignants, Finances & Bulletins',
    'Conforme aux systèmes éducatifs d\'Afrique Francophone',
    'Sécurité renforcée (MFA TOTP, OTP Email & ISO Ready)',
    'Disponible 24/7 sur ordinateur, tablette et smartphone',
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#020B08',
      fontFamily: designTokens.typography.fontBody,
      overflowX: 'hidden',
    }}>
      {/* ------------------------------------------------------------- */}
      {/* PANNEAU GAUCHE : BRANDING & EXPÉRIENCE VISUELLE               */}
      {/* ------------------------------------------------------------- */}
      <div className="login-branding-panel" style={{
        flex: '1 1 50%',
        background: designTokens.colors.bgBrandingGradient,
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid rgba(212, 168, 83, 0.15)',
      }}>
        {/* Éléments Décoratifs d'Arrière-Plan */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(13, 58, 42, 0.4) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(212, 168, 83, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }} />

        {/* EN-TÊTE BRANDING */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo & Marque */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D4A853 0%, #B8860B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: designTokens.shadows.glowGold,
            }}>
              <GraduationCap size={28} color="#051C14" strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#FFFFFF',
                fontFamily: designTokens.typography.fontTitle,
                letterSpacing: '-0.5px',
              }}>
                KPSyDesk <span style={{ color: designTokens.colors.brandGold }}>School</span>
              </h1>
              <span style={{ color: designTokens.colors.textMuted, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                GESTION SCOLAIRE SAAS MULTI-ÉTABLISSEMENTS
              </span>
            </div>
          </div>

          {/* Badge Pilule de Référence */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: designTokens.borderRadius.pill,
            backgroundColor: 'rgba(212, 168, 83, 0.12)',
            border: '1px solid rgba(212, 168, 83, 0.3)',
            color: designTokens.colors.brandGold,
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            marginBottom: '20px',
          }}>
            <Sparkles size={14} color={designTokens.colors.brandGold} />
            LA RÉFÉRENCE SAAS ÉDUCATION EN AFRIQUE
          </div>

          <h2 style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            marginBottom: '16px',
            fontFamily: designTokens.typography.fontTitle,
          }}>
            Pilotez votre établissement scolaire avec <span style={{
              background: 'linear-gradient(90deg, #D4A853 0%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>excellence et simplicité</span>.
          </h2>

          {/* Liste à Puces */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {featurePoints.map((point, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircle2 size={13} color="#10B981" />
                </div>
                <span style={{ color: designTokens.colors.textMuted, fontSize: '0.9rem' }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTRE : ILLUSTRATION VECTORIELLE & MODULES FLOTTANTS */}
        <div style={{
          position: 'relative',
          height: '340px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0',
          zIndex: 2,
        }}>
          {/* TODO_ILLUSTRATION: Remplaçable par un composant d'illustration SVG personnalisé si souhaité */}
          <GraduationIllustration style={{ width: '85%', height: '85%', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))' }} />

          {/* Badges Flottants Autour de l'Illustration */}
          {floatingModules.map((mod, i) => {
            const IconComp = mod.icon;
            return (
              <div
                key={i}
                className="floating-module-badge"
                style={{
                  position: 'absolute',
                  top: mod.top,
                  left: mod.left,
                  right: mod.right,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212, 168, 83, 0.25)',
                  borderRadius: '30px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                  transition: 'transform 0.3s ease',
                  cursor: 'default',
                  zIndex: 3,
                }}
              >
                <div style={{
                  padding: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 168, 83, 0.2)',
                  color: designTokens.colors.brandGold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <IconComp size={12} />
                </div>
                <span>{mod.label}</span>
              </div>
            );
          })}
        </div>

        {/* PIED DU PANNEAU GAUCHE */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: designTokens.colors.textDim, fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} KPSyDesk School — Tous droits réservés.
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: designTokens.colors.brandGold, fontSize: '0.8rem', fontWeight: 600 }}>🇸🇳 Sénégal</span>
            <span style={{ color: designTokens.colors.textMuted, fontSize: '0.8rem' }}>🇨🇮 Côte d'Ivoire</span>
            <span style={{ color: designTokens.colors.textMuted, fontSize: '0.8rem' }}>🇲🇱 Mali</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PANNEAU DROITE : CARTE AUTHENTIFICATION                       */}
      {/* ------------------------------------------------------------- */}
      <div className="login-form-panel" style={{
        flex: '1 1 50%',
        backgroundColor: '#070E17',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: designTokens.colors.surfaceDark,
          borderRadius: designTokens.borderRadius.card,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '36px',
          boxShadow: designTokens.shadows.cardShadow,
        }}>
          {/* Titre & Message de Bienvenue */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(212, 168, 83, 0.1)',
              color: designTokens.colors.brandGold,
              marginBottom: '12px',
            }}>
              <Lock size={22} />
            </div>
            <h2 style={{
              margin: '0 0 6px 0',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: designTokens.typography.fontTitle,
            }}>
              Espace de Connexion
            </h2>
            <p style={{ margin: 0, color: designTokens.colors.textMuted, fontSize: '0.88rem' }}>
              Accédez à votre portail d'établissement sécurisé
            </p>
          </div>

          {/* SÉLECTEUR DE RÔLE EN PILLS */}
          <div style={{
            display: 'flex',
            backgroundColor: designTokens.colors.surfaceInput,
            borderRadius: designTokens.borderRadius.pill,
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            {(['DIRECTOR', 'PROFESSEUR', 'ADMINISTRATEUR'] as const).map((r) => {
              const isActive = role === r;
              const labels = { DIRECTOR: 'Directeur', PROFESSEUR: 'Enseignant', ADMINISTRATEUR: 'Admin' };
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: designTokens.borderRadius.pill,
                    border: 'none',
                    backgroundColor: isActive ? designTokens.colors.brandGold : 'transparent',
                    color: isActive ? '#051C14' : designTokens.colors.textMuted,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          {/* SÉQUENCE D'AUTHENTIFICATION (Étape 1: Mot de passe -> Étape 2: OTP) */}
          {!challengeId ? (
            <PasswordStep 
              onSuccess={handlePasswordSuccess} 
              onRequireEnrollment={handleRequireEnrollment}
              onDirectLogin={handleDirectLoginSuccess}
              role={role}
              setRole={setRole}
            />
          ) : (
            <OtpStep 
              challengeId={challengeId} 
              userEmail={userEmail} 
              onVerifySuccess={handleOtpVerifySuccess} 
              onCancel={handleResetToPasswordStep} 
            />
          )}

          {/* SÉPARATEUR & LIEN INSCRIPTION TENANT */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 10px 0', color: designTokens.colors.textMuted, fontSize: '0.85rem' }}>
              Nouveau sur KPSyDesk School ?
            </p>
            <button
              onClick={() => navigate('/signup')}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(212, 168, 83, 0.4)',
                color: designTokens.colors.brandGold,
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.88rem',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 168, 83, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Inscrire un Établissement (Essai Gratuit)
            </button>
          </div>
        </div>

        {/* FOOTER BAS DE CARTE */}
        <div style={{
          marginTop: '24px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          color: designTokens.colors.textDim,
          fontSize: '0.78rem',
        }}>
          <button 
            onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)} 
            style={{ background: 'none', border: 'none', color: designTokens.colors.textMuted, cursor: 'pointer', fontSize: '0.78rem' }}
          >
            Politique de confidentialité
          </button>
          <span>•</span>
          <a href="mailto:support@kpsyinformatique.com" style={{ color: designTokens.colors.textMuted, textDecoration: 'none' }}>
            Support Technique
          </a>
        </div>
      </div>

      {/* STYLES RESPONSIVE EMBARQUÉS */}
      <style>{`
        @media (max-width: 1024px) {
          .login-branding-panel {
            display: none !important;
          }
          .login-form-panel {
            flex: 1 1 100% !important;
            padding: 24px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
