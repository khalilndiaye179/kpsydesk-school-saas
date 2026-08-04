import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Phone, Bus, GraduationCap, Calendar, Users, AlertTriangle, FileText, Settings, BookOpen, Radio, ShoppingCart, Printer, CloudCog, MonitorSmartphone } from 'lucide-react';
import { useAuth } from './AuthContext';
import { PasswordStep } from './PasswordStep';
import { OtpStep } from './OtpStep';

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

  // Modules flottants pour l'animation de gauche
  const floatingModules = [
    { icon: GraduationCap, label: 'Structure Pédago.', top: '15%', left: '55%', delay: '0s' },
    { icon: Shield, label: 'Ressources Humaines', top: '25%', left: '75%', delay: '1s' },
    { icon: Calendar, label: 'Emploi du temps', top: '45%', left: '50%', delay: '2s' },
    { icon: Bus, label: 'Transport Scolaire', top: '40%', left: '85%', delay: '1.5s' },
    { icon: Users, label: 'Élèves & Inscriptions', top: '60%', left: '65%', delay: '0.5s' },
    { icon: Calendar, label: 'Tableau de Bord', top: '70%', left: '80%', delay: '2.5s' },
    { icon: AlertTriangle, label: 'Absences & Retards', top: '80%', left: '45%', delay: '1s' },
    { icon: FileText, label: 'Pointage', top: '85%', left: '65%', delay: '0s' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#03140e', fontFamily: 'var(--font-main)' }}>
      
      {/* LEFT SECTION - Background & Branding avec l'illustration de refonte */}
      <div style={{ 
        flex: '7', position: 'relative', overflow: 'hidden',
        backgroundImage: 'linear-gradient(rgba(3, 20, 14, 0.45), rgba(3, 20, 14, 0.85)), url("/login-bg.png")',
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        borderRight: '1px solid rgba(217, 119, 6, 0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        
        {/* Modules flottants en style Verre Doré (Matching Maquette) */}
        {floatingModules.map((mod, idx) => (
          <div key={idx} style={{
            position: 'absolute', top: mod.top, left: mod.left,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2
          }}>
            <div style={{
              backgroundColor: 'rgba(217, 119, 6, 0.15)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '20px', padding: '14px', color: '#f59e0b',
              boxShadow: '0 10px 30px rgba(217, 119, 6, 0.25)'
            }}>
              <mod.icon size={24} color="#f59e0b" />
            </div>
            <span style={{ color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(5, 25, 18, 0.75)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 10px', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
              {mod.label}
            </span>
          </div>
        ))}

        {/* Logo Entreprise Haut Gauche (K'PSY INFORMATIQUE) */}
        <div style={{ position: 'absolute', top: '28px', left: '36px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(168, 85, 247, 0.4)', backdropFilter: 'blur(10px)' }}>
            <Radio size={26} color="#c084fc" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.45rem', letterSpacing: '1px', fontFamily: 'var(--font-title)' }}>
              K'PSY <span style={{ color: '#c084fc' }}>INFORMATIQUE</span>
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Khalil' Prestation Systèmes Informatiques
            </span>
          </div>
        </div>

        {/* Texte Marketing Central */}
        <div style={{ position: 'absolute', top: '16%', left: '7%', maxWidth: '620px', zIndex: 2, pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.35)', marginBottom: '24px', backdropFilter: 'blur(8px)' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%', boxShadow: '0 0 10px #f59e0b' }}></span>
            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>• LA RÉFÉRENCE SAAS ÉDUCATION</span>
          </div>
          
          <h1 style={{ fontSize: '3.6rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, marginBottom: '24px', fontFamily: 'var(--font-title)', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
            Le pilotage de votre école <span style={{ color: '#f59e0b', background: 'linear-gradient(135deg, #fbbf24, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>réinventé.</span>
          </h1>
          
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '36px', maxWidth: '540px', fontWeight: 400 }}>
            KPSySchool centralise toute votre gestion scolaire sur une plateforme cloud sécurisée, intuitive et ultra-performante.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              "Authentification Séquentielle 2FA à Défi OTP",
              "Gestion Scolaire 360° (Élèves, RH, Finances)",
              "Sécurité maximale & Données cloud 100% isolées",
              "Accessible partout, sur PC, Tablette et Mobile"
            ].map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '5px', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: '50%', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  <Shield size={16} color="#f59e0b" />
                </div>
                <span style={{ color: '#f1f5f9', fontSize: '1.02rem', fontWeight: 600 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pied de page Contact Gauche */}
        <div style={{ position: 'absolute', bottom: '3%', left: '7%', right: '15%', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '28px', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.12)', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={15} color="#f59e0b" /> 77 029 11 50 / 78 201 33 99</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={15} color="#f59e0b" /> kpsyinformastik@gmail.com</div>
          </div>

          <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
            <p style={{ margin: '0 0 4px 0' }}>
              KPSySchool v2.0.0 © 2026 - Tous droits réservés.{' '}
              <span style={{ marginLeft: '10px', textDecoration: 'underline', cursor: 'pointer', color: '#f59e0b', fontWeight: 600 }} onClick={() => setShowPrivacyPolicy(true)}>
                Protection des données
              </span>
            </p>
            <p style={{ margin: 0 }}>Développé avec passion par <strong style={{ color: '#e2e8f0' }}>Ibrahima NDIAYE</strong></p>
          </div>
        </div>

      </div>

      {/* RIGHT SECTION - Carte de connexion Émeraude & Or d'après la maquette */}
      <div style={{ 
        flex: '3', minWidth: '420px', maxWidth: '520px', backgroundColor: '#051811',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 32px'
      }}>
        
        {/* Glass Card Émeraude Sombre */}
        <div style={{
          width: '100%', backgroundColor: 'rgba(6, 29, 21, 0.88)', backdropFilter: 'blur(25px)',
          borderRadius: '28px', border: '1px solid rgba(217, 119, 6, 0.35)', padding: '40px 32px',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(217, 119, 6, 0.12)', marginBottom: '28px'
        }}>
          
          {/* Logo KPSySchool */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#f59e0b" />
              <path d="M2 17L12 22L22 17" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 style={{ margin: 0, fontSize: '1.65rem', color: '#ffffff', fontWeight: 800, letterSpacing: '0.5px', fontFamily: 'var(--font-title)' }}>
              KPSySchool
            </h1>
          </div>

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

        {/* Pied de page Droit avec Icônes */}
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', width: '100%' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#cbd5e1' }}>Établissement Démo / SaaS Multi-Tenant</p>
          <p style={{ margin: '0 0 20px 0' }}>Support : support@kpsyschool.com | Phone : +221 33 000 0000</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '28px' }}>
            {[
              { icon: Settings, label: 'Administration' },
              { icon: GraduationCap, label: 'Classes' },
              { icon: FileText, label: 'Examens' },
              { icon: BookOpen, label: 'Librairie' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <item.icon size={18} color="#f59e0b" />
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODALE DE PROTECTION DES DONNÉES */}
      {showPrivacyPolicy && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#061d15', width: '90%', maxWidth: '700px', maxHeight: '80vh',
            borderRadius: '20px', border: '1px solid rgba(217, 119, 6, 0.4)', padding: '32px',
            overflowY: 'auto', color: '#cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(217, 119, 6, 0.2)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-title)' }}>Charte de protection des données</h2>
              <button onClick={() => setShowPrivacyPolicy(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.8rem', padding: 0 }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: 1.6 }}>
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Protection de vos données personnelles</h3>
                <p style={{ margin: 0 }}>KPSySchool s'engage à protéger les données que vous nous confiez, dans le respect de la loi sénégalaise n° 2008-12 du 25 janvier 2008 relative à la protection des données à caractère personnel, sous le contrôle de la Commission de Protection des Données Personnelles (CDP).</p>
              </div>

              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Isolation totale entre entreprises abonnées</h3>
                <p style={{ margin: 0 }}>Chaque organisation cliente dispose d'un espace de données strictement cloisonné. Aucune entreprise abonnée ne peut accéder, même partiellement, aux données d'une autre — cette isolation est appliquée au niveau technique de notre infrastructure, pas seulement au niveau de l'interface.</p>
              </div>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'right' }}>
              <button onClick={() => setShowPrivacyPolicy(false)} style={{ padding: '12px 24px', backgroundColor: '#f59e0b', color: '#03140e', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

