import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Mail, Phone, Bus, GraduationCap, Calendar, Users, 
  AlertTriangle, FileText, CheckCircle2, Sparkles, HelpCircle, Lock, X
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

  // MODALES INFORMATIVES
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

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

  // Modules flottants positionnés autour de l'illustration pour meubler le panneau visuel
  const floatingModules = [
    { icon: GraduationCap, label: 'Structure Collège & Lycée', top: '5%', left: '4%' },
    { icon: Shield, label: 'Bulletins Officiels & QR Code', top: '8%', right: '4%' },
    { icon: Calendar, label: 'Emploi du Temps & Paie RH', top: '46%', left: '2%' },
    { icon: Bus, label: 'Transport & Cantine Scolaire', top: '42%', right: '2%' },
    { icon: Users, label: 'Séries L1, L2, S1, S2, A, C, D', top: '78%', left: '6%' },
    { icon: FileText, label: 'Mobile Money (Wave, OM, MTN)', top: '80%', right: '6%' },
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
        {/* Éléments Décoratifs & Filigranes Pédagogiques Translucides */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '350px', height: '350px', borderRadius: '50%',
          backgroundColor: 'rgba(212, 168, 83, 0.05)', filter: 'blur(70px)', pointerEvents: 'none',
        }} />

        {/* FILIGRANES PÉDAGOGIQUES VECTORIELS EN ARRIÈRE-PLAN */}
        <svg
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            opacity: 0.06, pointerEvents: 'none', zIndex: 1,
          }}
          viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          {/* Filigrane 1 : Chapeau de Diplôme Géant en haut à droite */}
          <g transform="translate(500, 40) scale(1.8)" stroke="#D4A853" strokeWidth="2">
            <polygon points="60,20 110,40 60,60 10,40" fill="none" />
            <path d="M 30 50 L 30 75 Q 60 95 90 75 L 90 50" fill="none" />
            <path d="M 100 45 L 115 70 L 115 90" strokeWidth="3" />
            <circle cx="115" cy="92" r="4" fill="#D4A853" />
          </g>

          {/* Filigrane 2 : Livre Ouvert et Boussole Éducation au centre gauche */}
          <g transform="translate(40, 450) scale(1.5)" stroke="#D4A853" strokeWidth="2">
            <path d="M 20 60 Q 60 40 100 60 L 100 120 Q 60 100 20 120 Z" fill="none" />
            <path d="M 100 60 Q 140 40 180 60 L 180 120 Q 140 100 100 120 Z" fill="none" />
            <line x1="100" y1="60" x2="100" y2="120" strokeWidth="3" />
          </g>

          {/* Filigrane 3 : Symboles Mathématiques & Scientifiques (pi, racine, delta) */}
          <g fill="#D4A853" fontSize="48" fontFamily="sans-serif" fontWeight="bold">
            <text x="650" y="420">π</text>
            <text x="80" y="250">√x</text>
            <text x="600" y="680">Δ</text>
            <text x="120" y="720">∑</text>
          </g>

          {/* Filigrane 4 : Microscope Sciences en bas à droite */}
          <g transform="translate(620, 520) scale(1.4)" stroke="#D4A853" strokeWidth="2">
            <circle cx="50" cy="30" r="12" />
            <line x1="50" y1="42" x2="50" y2="80" strokeWidth="4" />
            <rect x="25" y="80" width="50" height="10" rx="2" fill="#D4A853" />
          </g>
        </svg>

        {/* LOGO PLATEFORME & HEADER BRANDING */}
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              backgroundColor: 'rgba(212, 168, 83, 0.15)', border: '1.5px solid rgba(212, 168, 83, 0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: designTokens.colors.brandGold,
            }}>
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 style={{
                margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF',
                letterSpacing: '0.5px', fontFamily: designTokens.typography.fontTitle,
              }}>
                KPSyDesk School
              </h1>
              <span style={{ fontSize: '0.8rem', color: designTokens.colors.brandGold, fontWeight: 700, letterSpacing: '1px' }}>
                ERP ÉDUCATIF SAAS MULTI-TENANT
              </span>
            </div>
          </div>

          {/* ENCART POINTS FORTS PRODUIT - POSITIONNÉ HAUT GAUCHE & POLICES AGRANDIES */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '14px',
            backgroundColor: 'rgba(5, 28, 20, 0.85)', padding: '24px 28px', borderRadius: '20px',
            border: '1.5px solid rgba(212, 168, 83, 0.4)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          }}>
            {featurePoints.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700 }}>
                <CheckCircle2 size={24} color={designTokens.colors.brandGold} style={{ flexShrink: 0 }} />
                <span style={{ lineHeight: '1.4', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENU CENTRAL : ILLUSTRATION VECTORIELLE INTERACTIVE */}
        <div style={{
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          margin: 'auto 0', position: 'relative', height: '380px', width: '100%',
        }}>
          {/* Illustration de remise de diplômes / éducation */}
          <div style={{ width: '330px', height: '330px', opacity: 0.95 }}>
            <GraduationIllustration />
          </div>

          {/* Badges Flottants des Modules de la Solution ERP */}
          {floatingModules.map((m, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: m.top,
                left: m.left,
                right: m.right,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 18px',
                borderRadius: designTokens.borderRadius.pill,
                backgroundColor: 'rgba(5, 28, 20, 0.9)',
                border: '1px solid rgba(212, 168, 83, 0.4)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 700,
                pointerEvents: 'none',
              }}
            >
              <m.icon size={20} color={designTokens.colors.brandGold} />
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PANNEAU DROIT : FORMULAIRE D'AUTHENTIFICATION COMPACT        */}
      {/* ------------------------------------------------------------- */}
      <div className="login-form-panel" style={{
        flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '40px', backgroundColor: '#020B08', position: 'relative',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px', backgroundColor: 'rgba(5, 28, 20, 0.75)',
          borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '36px', boxShadow: designTokens.shadows.cardShadow,
        }}>
          {/* Titre & Message de Bienvenue */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', padding: '14px', borderRadius: '16px',
              backgroundColor: 'rgba(212, 168, 83, 0.15)', color: designTokens.colors.brandGold, marginBottom: '14px',
              border: '1px solid rgba(212, 168, 83, 0.3)',
            }}>
              <Lock size={28} />
            </div>
            <h2 style={{
              margin: '0 0 6px 0', fontSize: '1.5rem', fontWeight: 700,
              color: '#FFFFFF', fontFamily: designTokens.typography.fontTitle,
            }}>
              Espace de Connexion
            </h2>
            <p style={{ margin: 0, color: designTokens.colors.textMuted, fontSize: '0.88rem' }}>
              Accédez à votre portail d'établissement sécurisé
            </p>
          </div>

          {/* SÉLECTEUR DE RÔLE EN PILLS */}
          <div style={{
            display: 'flex', backgroundColor: designTokens.colors.surfaceInput,
            borderRadius: designTokens.borderRadius.pill, padding: '4px', marginBottom: '24px',
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
                    flex: 1, padding: '8px 12px', borderRadius: designTokens.borderRadius.pill,
                    border: 'none', backgroundColor: isActive ? designTokens.colors.brandGold : 'transparent',
                    color: isActive ? '#051C14' : designTokens.colors.textMuted,
                    fontWeight: isActive ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          {/* SÉQUENCE D'AUTHENTIFICATION */}
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

          {/* BOUTON ÉLÉGANT INSCRIPTION D'ÉTABLISSEMENT */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px 0', color: designTokens.colors.textMuted, fontSize: '0.85rem' }}>
              Vous souhaitez équiper votre établissement ?
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
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(212, 168, 83, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Inscrire un Établissement (Essai Gratuit 7 Jours)
            </button>
          </div>
        </div>

        {/* FOOTER BAS DE PAGE AVEC VRAIS LIENS PRIVACY, SUPPORT & COPYRIGHT */}
        <div style={{
          marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center',
          color: designTokens.colors.textDim, fontSize: '0.78rem',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={() => setShowPrivacyModal(true)} 
              style={{ background: 'none', border: 'none', color: designTokens.colors.textMuted, cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline' }}
            >
              Politique de confidentialité
            </button>
            <span>•</span>
            <button 
              onClick={() => setShowSupportModal(true)} 
              style={{ background: 'none', border: 'none', color: designTokens.colors.textMuted, cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline' }}
            >
              Support Technique
            </button>
          </div>
          <div style={{ color: designTokens.colors.textDim, fontSize: '0.75rem', opacity: 0.85, marginTop: '4px', textAlign: 'center' }}>
            © 2026 KPSyDesk School · Conçu et développé par <strong>KPSY Informatique</strong>. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODALE 1 : POLITIQUE DE CONFIDENTIALITÉ & PROTECTION          */}
      {/* ------------------------------------------------------------- */}
      {showPrivacyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: '#051C14', border: '1px solid rgba(212, 168, 83, 0.3)', padding: '28px', borderRadius: '20px', width: '550px', maxWidth: '90vw', color: 'white', position: 'relative', textAlign: 'left' }}>
            <button onClick={() => setShowPrivacyModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ margin: '0 0 12px 0', color: designTokens.colors.brandGold, fontFamily: designTokens.typography.fontTitle }}>
              🛡️ Engagement & Protection des Données Personnelles
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              <strong>KPSyDesk School</strong> s'engage à garantir la confidentialité intégrale et la sécurité des données des établissements scolaires, enseignants, élèves et tuteurs.
            </p>
            <ul style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li><strong>Conformité Légale :</strong> Respect strict de la Loi Sénégalaise N° 2008-12 (CDP), de la Loi Ivoirienne N° 2013-450 (CPTDP) et Malienne sur la protection des données.</li>
              <li><strong>Isolation Multi-Tenant :</strong> Vos données d'établissement sont hermétiquement isolées et chiffrées en base de données (AES-256 / SSL).</li>
              <li><strong>Hébergement Sécurisé :</strong> Serveurs haute disponibilité et sauvegardes automatisées quotidiennes.</li>
              <li><strong>Droit d'Accès :</strong> Chaque titulaire conserve un droit absolu de rectification et de suppression sur ses informations nominatives.</li>
            </ul>
            <button onClick={() => setShowPrivacyModal(false)} style={{ width: '100%', padding: '10px', backgroundColor: designTokens.colors.brandGold, color: '#051C14', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}>
              J'ai Compris
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALE 2 : ASSISTANCE & SUPPORT TECHNIQUE CLIENT              */}
      {/* ------------------------------------------------------------- */}
      {showSupportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: '#051C14', border: '1px solid rgba(212, 168, 83, 0.3)', padding: '28px', borderRadius: '20px', width: '500px', maxWidth: '90vw', color: 'white', position: 'relative', textAlign: 'left' }}>
            <button onClick={() => setShowSupportModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ margin: '0 0 12px 0', color: designTokens.colors.brandGold, fontFamily: designTokens.typography.fontTitle }}>
              🎧 Assistance & Support Technique 24/7
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '16px' }}>
              Une équipe d'ingénieurs dédiée est à votre disposition pour vous accompagner dans le déploiement et l'utilisation quotidienne de KPSyDesk School.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <Mail color="#D4A853" size={18} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Email Support Direct</div>
                  <strong style={{ color: 'white' }}>kpsydesk.support@kpsyinformatique.com</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <Phone color="#D4A853" size={18} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ligne Téléphonique / Urgence</div>
                  <strong style={{ color: 'white' }}>+221 76 261 39 39 / +221 33 858 51 24</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <Phone color="#25D366" size={18} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assistance Instantanée WhatsApp</div>
                  <strong style={{ color: '#25D366' }}>+221 76 261 39 39</strong>
                </div>
              </div>
            </div>

            <button onClick={() => setShowSupportModal(false)} style={{ width: '100%', padding: '10px', backgroundColor: designTokens.colors.brandGold, color: '#051C14', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}>
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
