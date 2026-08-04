import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Mail, Phone, Bus, GraduationCap, Calendar, Users, 
  AlertTriangle, FileText, Settings, BookOpen, Check, Star 
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { PasswordStep } from './PasswordStep';
import { OtpStep } from './OtpStep';
import { GraduationIllustration } from '../components/shared/GraduationIllustration';

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
    { icon: GraduationCap, label: 'Structure Pédago', top: '12%', left: '55%' },
    { icon: Shield, label: 'Ressources Humaines', top: '22%', left: '78%' },
    { icon: Calendar, label: 'Emploi du temps', top: '42%', left: '52%' },
    { icon: Bus, label: 'Transport Scolaire', top: '38%', left: '84%' },
    { icon: Users, label: 'Élèves & Inscriptions', top: '60%', left: '68%' },
    { icon: AlertTriangle, label: 'Absences & Retards', top: '78%', left: '48%' },
    { icon: FileText, label: 'Pointage', top: '82%', left: '72%' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>
      
      {/* 🏛️ COLONNE GAUCHE (65% Largeur) - Fond Crème #F5F1E8 */}
      <div style={{ 
        flex: '65', backgroundColor: '#F5F1E8', position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '36px 48px', boxSizing: 'border-box', overflowY: 'auto'
      }}>
        
        {/* En-tête Marque : Logo K'PSY INFORMATIQUE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 2 }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#1B3B2F',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A853',
            fontWeight: 900, fontSize: '1rem', boxShadow: '0 4px 12px rgba(27, 59, 47, 0.2)'
          }}>
            K'PSY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#1B3B2F', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.5px', fontFamily: 'var(--font-title)' }}>
              K'PSY INFORMATIQUE
            </span>
            <span style={{ color: '#5A6E63', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              KHALIL' PRESTATION SYSTEMES INFORMATIQUES
            </span>
          </div>
        </div>

        {/* Section Contenu Principal & Marketing */}
        <div style={{ maxWidth: '640px', marginTop: '32px', marginBottom: '32px', zIndex: 2 }}>
          
          {/* Badge Pilule Doré */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(212, 168, 83, 0.18)', border: '1px solid #D4A853',
            padding: '6px 16px', borderRadius: '20px', marginBottom: '20px'
          }}>
            <Star size={14} color="#D4A853" fill="#D4A853" />
            <span style={{ color: '#1B3B2F', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              LA RÉFÉRENCE SAAS EDUCATION
            </span>
          </div>

          {/* Titre Principal */}
          <h1 style={{
            fontSize: '3.2rem', fontWeight: 900, color: '#111827', lineHeight: 1.15,
            marginBottom: '16px', fontFamily: 'var(--font-title)'
          }}>
            Le pilotage de votre école <span style={{ color: '#D4A853' }}>réinventé.</span>
          </h1>

          {/* Paragraphe Descriptif */}
          <p style={{ fontSize: '1.05rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '28px', maxWidth: '580px' }}>
            KPSySchool centralise toute votre gestion scolaire sur une plateforme cloud sécurisée, intuitive et ultra-performante.
          </p>

          {/* 4 Lignes de bénéfices avec puces rondes Vert Forêt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {[
              "Authentification Séquentielle 2FA à Défi OTP",
              "Gestion Scolaire 360° (Élèves, RH, Finances)",
              "Sécurité maximale & Données cloud 100% isolées",
              "Accessible partout, sur PC, Tablette et Mobile"
            ].map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#1B3B2F',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Check size={13} color="#FFFFFF" strokeWidth={3} />
                </div>
                <span style={{ color: '#1F2937', fontSize: '0.98rem', fontWeight: 600 }}>{point}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Illustration Héro SVG (Diplômés, toges, toques lancées en l'air & drapeaux UEMOA) */}
        <div style={{ position: 'absolute', top: '15%', right: '2%', width: '46%', height: '68%', pointerEvents: 'none', zIndex: 1 }}>
          
          <GraduationIllustration style={{ width: '100%', height: '100%' }} />

          {/* Badges Flottants des Modules */}
          {floatingModules.map((mod, idx) => (
            <div key={idx} style={{
              position: 'absolute', top: mod.top, left: mod.left,
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(212, 168, 83, 0.4)', borderRadius: '20px',
              padding: '6px 12px', boxShadow: '0 8px 20px rgba(27, 59, 47, 0.12)', zIndex: 2
            }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(27, 59, 47, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <mod.icon size={13} color="#1B3B2F" />
              </div>
              <span style={{ color: '#1B3B2F', fontSize: '0.72rem', fontWeight: 700 }}>{mod.label}</span>
            </div>
          ))}
        </div>

        {/* Footer Gauche */}
        <div style={{ zIndex: 2, borderTop: '1px solid rgba(27, 59, 47, 0.12)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '24px', color: '#374151', fontSize: '0.82rem', marginBottom: '8px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="#1B3B2F" /> 77 029 11 50 / 78 201 33 99</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color="#1B3B2F" /> kpsyinformastik@gmail.com</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6B7280', fontSize: '0.75rem' }}>
            <span>
              KPSySchool v2.0.0 © 2026 · Tous droits réservés.{' '}
              <span 
                onClick={() => setShowPrivacyPolicy(true)} 
                style={{ color: '#1B3B2F', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700, marginLeft: '8px' }}
              >
                Protection des données
              </span>
            </span>
            <span>Développé avec passion par <strong style={{ color: '#1B3B2F' }}>Ibrahima NDIAYE</strong></span>
          </div>
        </div>

      </div>

      {/* 🌲 COLONNE DROITE (35% Largeur) - Fond Vert Forêt #1B3B2F */}
      <div style={{ 
        flex: '35', minWidth: '400px', backgroundColor: '#1B3B2F',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 36px', boxSizing: 'border-box', overflowY: 'auto'
      }}>
        
        {/* Header Logo KPSySchool */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GraduationCap size={32} color="#D4A853" />
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#FFFFFF', fontWeight: 900, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>
            KPSySchool
          </h2>
        </div>

        {/* Section Formulaire Authentification (PasswordStep ou OtpStep) */}
        <div style={{ margin: 'auto 0', padding: '24px 0' }}>
          {!challengeId ? (
            <PasswordStep 
              onSuccess={handlePasswordSuccess}
              onRequireEnrollment={handleRequireEnrollment}
              onDirectLogin={handleOtpVerifySuccess}
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
        </div>

        {/* Footer Droit avec Icônes d'Accès Rapide */}
        <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.75rem', borderTop: '1px solid rgba(212, 168, 83, 0.2)', paddingTop: '20px' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#E5E7EB' }}>Établissement Démo / SaaS Multi-Tenant</p>
          <p style={{ margin: '0 0 16px 0', color: '#9CA3AF', fontSize: '0.72rem' }}>Support : support@kpsyschool.com | Phone : +221 33 000 0000</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            {[
              { icon: Settings, label: 'Administration' },
              { icon: GraduationCap, label: 'Classes' },
              { icon: FileText, label: 'Examens' },
              { icon: BookOpen, label: 'Librairie' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <item.icon size={16} color="#D4A853" />
                <span style={{ fontSize: '0.65rem', color: '#D1D5DB' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODALE DE PROTECTION DES DONNÉES */}
      {showPrivacyPolicy && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1B3B2F', width: '90%', maxWidth: '640px', maxHeight: '80vh',
            borderRadius: '24px', border: '1px solid #D4A853', padding: '32px',
            overflowY: 'auto', color: '#E5E7EB', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 168, 83, 0.3)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-title)' }}>Charte de protection des données</h2>
              <button onClick={() => setShowPrivacyPolicy(false)} style={{ background: 'none', border: 'none', color: '#D4A853', cursor: 'pointer', fontSize: '1.8rem' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: 1.6, fontSize: '0.9rem' }}>
              <div>
                <h3 style={{ color: '#D4A853', fontSize: '1.05rem', margin: '0 0 6px 0' }}>Protection des données personnelles</h3>
                <p style={{ margin: 0 }}>KPSySchool s'engage à protéger les données personnelles dans le respect de la loi sénégalaise n° 2008-12 du 25 janvier 2008 et des réglementations régionales UEMOA.</p>
              </div>

              <div>
                <h3 style={{ color: '#D4A853', fontSize: '1.05rem', margin: '0 0 6px 0' }}>Isolation totale Multi-Tenant</h3>
                <p style={{ margin: 0 }}>Chaque établissement scolaire cliente dispose d'un espace de données strictly étanche. Aucune organisation ne peut accéder aux données d'une autre.</p>
              </div>
            </div>

            <div style={{ marginTop: '28px', textAlign: 'right' }}>
              <button onClick={() => setShowPrivacyPolicy(false)} style={{ padding: '10px 24px', backgroundColor: '#D4A853', color: '#1B3B2F', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
