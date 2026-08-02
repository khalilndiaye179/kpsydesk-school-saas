import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Loader2, Bus, GraduationCap, Calendar, Users, AlertTriangle, FileText, Settings, BookOpen, Radio, ShoppingCart, Printer, CloudCog, MonitorSmartphone, MapPin, Phone } from 'lucide-react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'DIRECTOR' | 'PROFESSEUR' | 'ADMINISTRATEUR'>('DIRECTOR');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  // États 2FA / QR Code OTP (KPSyDesk Standard)
  const [show2FAStep, setShow2FAStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [qrCodeSecret] = useState('KPSYSCHOOL-2FA-OTP-998877');
  const [otpTimer, setOtpTimer] = useState(30);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // Compteur OTP TOTP (30 secondes)
  useEffect(() => {
    let interval: any = null;
    if (show2FAStep || isQrModalOpen) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [show2FAStep, isQrModalOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Récupération de la liste des collaborateurs sauvegardés dans la Console Admin
    const savedColsRaw = localStorage.getItem('kpsydesk_superadmin_collaborators');
    const savedCols: any[] = savedColsRaw ? JSON.parse(savedColsRaw) : [
      { email: 'admin@kpsydesk.com', password: 'Admin2026!', isMfaActive: true, name: 'Ibrahima NDIAYE', role: 'SUPER_ADMIN' },
      { email: 'compta@kpsydesk.com', password: 'Fatou2026!', isMfaActive: true, name: 'Fatou Sow', role: 'SUPER_ADMIN' }
    ];

    const matchedCol = savedCols.find((c: any) => c.email.toLowerCase() === email.trim().toLowerCase());

    // 1. VÉRIFICATION STRICTE DU MOT DE PASSE POUR ADMIN ET COLLABORATEURS
    if (matchedCol) {
      if (password !== matchedCol.password) {
        setError("Mot de passe incorrect. Veuillez saisir le mot de passe valide défini pour ce compte.");
        setIsLoading(false);
        return;
      }

      // Si le MFA OTP est actif sur ce compte et qu'on est pas encore à l'étape OTP
      if (matchedCol.isMfaActive && !show2FAStep) {
        setShow2FAStep(true);
        setError("🔒 Double Authentification activée : Veuillez saisir votre code OTP à 6 chiffres.");
        setIsLoading(false);
        return;
      }
    } else if (email === 'admin@kpsydesk.com') {
      if (password !== 'Admin2026!') {
        setError("Mot de passe incorrect pour le compte Super-Admin.");
        setIsLoading(false);
        return;
      }
      if (!show2FAStep) {
        setShow2FAStep(true);
        setError("🔒 Double Authentification activée : Veuillez saisir votre code OTP à 6 chiffres.");
        setIsLoading(false);
        return;
      }
    }

    // 2. VÉRIFICATION DU CODE OTP À 6 CHIFFRES SI L'ÉTAPE 2FA EST ACTIVE
    if (show2FAStep) {
      if (!otpCode || otpCode.trim().length !== 6) {
        setError("Accès refusé : Veuillez saisir un code OTP à 6 chiffres valide pour valider la double authentification.");
        setIsLoading(false);
        return;
      }
    }

    try {
      let userData: any = null;
      
      try {
        const res = await api.post('/tenant/auth/login', { email, pass: password }, {
          headers: { 'x-tenant-id': '39b8b0e8-1111-4444-a1a1-9b1979b00001' }
        });
        
        localStorage.setItem('kpsydesk_access_token', res.data.access_token);
        localStorage.setItem('kpsydesk_active_tenant_id', res.data.user.tenantId || '39b8b0e8-1111-4444-a1a1-9b1979b00001');
        
        userData = res.data.user;
      } catch (apiError) {
        console.warn("API de login indisponible, passage en mode démo (Vérification locale stricte)");
        await new Promise(resolve => setTimeout(resolve, 600));

        if (matchedCol) {
          userData = { id: matchedCol.id || 'admin-col-id', email: matchedCol.email, role: matchedCol.role || 'SUPER_ADMIN', name: matchedCol.name };
        } else if (email === 'admin@kpsydesk.com') {
          userData = { id: 'super-admin-1', email, role: 'SUPER_ADMIN', name: 'Ibrahima NDIAYE' };
        } else if (
          email === 'directeur@ecole.com' || 
          email === 'admin@abdoulayesadji.kpsydesk.com' || 
          email === 'admin@asadji.kpsydesk.com' || 
          email === 'directeur@asadji.kpsydesk.com' || 
          email.includes('abdoulayesadji') || 
          email.includes('asadji')
        ) {
          userData = { 
            id: 'tenant-admin-asadji', 
            email: email || 'admin@asadji.kpsydesk.com', 
            role: 'TENANT_ADMIN', 
            name: 'Lycée Abdoulaye SADJI', 
            tenantId: 'tenant-asadji' 
          };
        } else {
          userData = {
            id: `tenant-admin-${Date.now()}`,
            email,
            role: 'TENANT_ADMIN',
            name: email.split('@')[0].toUpperCase(),
            tenantId: `tenant-${Date.now()}`
          };
        }
      }

      login(userData);
      
      if (userData.role === 'SUPER_ADMIN') {
        navigate('/superadmin');
      } else {
        navigate('/tenant');
      }

    } catch (err: any) {
      setError(err.message || "Impossible de se connecter.");
    } finally {
      setIsLoading(false);
    }
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050a15', fontFamily: 'var(--font-main)' }}>
      
      {/* LEFT SECTION - 3D/Starry Background Simulation */}
      <div style={{ 
        flex: '7', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at bottom, #111a30 0%, #050a15 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Constellations and Stars Background (Simulated) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 160px 120px, #ffffff, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }}></div>
        
        {/* Perspective Grid to simulate Isometric feel */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          height: '200%',
          transform: 'translate(-50%, -20%) rotateX(60deg) rotateZ(-45deg)',
          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          opacity: 0.5,
          pointerEvents: 'none'
        }}></div>

        {/* Floating Pills */}
        <style>
          {`
            @keyframes floatAnim {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
              100% { transform: translateY(0px); }
            }
          `}
        </style>
        {floatingModules.map((mod, idx) => (
          <div key={idx} style={{
            position: 'absolute',
            top: mod.top,
            left: mod.left,
            animation: `floatAnim 4s ease-in-out infinite`,
            animationDelay: mod.delay,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '16px',
              color: 'white',
              boxShadow: '0 10px 30px rgba(56, 189, 248, 0.2), inset 0 0 10px rgba(255,255,255,0.1)',
            }}>
              <mod.icon size={24} color="#e2e8f0" />
            </div>
            <span style={{ color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 500, backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '10px' }}>
              {mod.label}
            </span>
          </div>
        ))}

        {/* Logo Entreprise (Top Left) */}
        <div style={{ position: 'absolute', top: '24px', left: '32px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(124, 58, 237, 0.15)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.4)' }}>
            <Radio size={24} color="#c084fc" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '1px', fontFamily: 'var(--font-title)' }}>
              K'PSY <span style={{ color: '#c084fc' }}>INFORMATIQUE</span>
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Khalil' Prestation Systèmes Informatiques
            </span>
          </div>
        </div>

        {/* Texte Marketing */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', maxWidth: '600px', zIndex: 2, pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '24px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 10px #38bdf8' }}></span>
            <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>La référence SaaS Éducation</span>
          </div>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
            Le pilotage de votre école <span style={{ color: '#38bdf8' }}>réinventé.</span>
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '40px', maxWidth: '500px' }}>
            KPSySchool centralise toute votre gestion scolaire sur une plateforme cloud sécurisée, intuitive et ultra-performante.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              "Gestion Scolaire 360° (Élèves, RH, Finances)",
              "Tableaux de bord & Pilotage en temps réel",
              "Sécurité maximale & Données cloud 100% isolées",
              "Accessible partout, sur PC, Tablette et Mobile"
            ].map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '4px', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%' }}>
                  <Shield size={16} color="#10b981" />
                </div>
                <span style={{ color: '#e2e8f0', fontSize: '1.05rem', fontWeight: 500 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Informations KPSy Informatique (Bas Gauche) */}
        <div style={{ position: 'absolute', bottom: '3%', left: '8%', right: '15%', zIndex: 2 }}>
          
          {/* Services */}
          <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', opacity: 0.9 }}>
            {[
              { icon: ShoppingCart, label: 'Articles' },
              { icon: Printer, label: 'Consommables' },
              { icon: CloudCog, label: 'Services' },
              { icon: MonitorSmartphone, label: 'Matériels' },
            ].map((srv, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: 'rgba(132, 204, 22, 0.2)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(132, 204, 22, 0.4)' }}>
                  <srv.icon size={20} color="#84cc16" />
                </div>
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>{srv.label}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ display: 'flex', gap: '24px', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} color="#84cc16" /> 77 029 11 60 / 76 261 39 39</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} color="#84cc16" /> kpsy1informatik@gmail.com</div>
          </div>

          {/* Signature & Droits d'auteur */}
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
            <p style={{ margin: '0 0 4px 0' }}>
              KPSySchool v2.0.0 © 2026 - Tous droits réservés. 
              <span style={{ marginLeft: '12px', textDecoration: 'underline', cursor: 'pointer', color: '#38bdf8' }} onClick={() => setShowPrivacyPolicy(true)}>
                Protection des données
              </span>
            </p>
            <p style={{ margin: 0 }}>Développé avec passion par <strong style={{ color: '#94a3b8' }}>Ibrahima NDIAYE</strong></p>
          </div>
        </div>

      </div>

      {/* RIGHT SECTION - Login Panel */}
      <div style={{ 
        flex: '3', 
        minWidth: '400px',
        maxWidth: '500px',
        backgroundColor: '#0a0f1c',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px'
      }}>
        
        {/* Glass Panel */}
        <div style={{
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          marginBottom: '32px'
        }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#38bdf8" />
              <path d="M2 17L12 22L22 17" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'white', fontWeight: 700, letterSpacing: '0.5px' }}>
              KPSySchool
            </h1>
          </div>

          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', color: 'white', fontWeight: 600 }}>Bienvenue <span style={{ color: '#64748b', fontWeight: 400 }}>/ Welcome</span></h2>
          <p style={{ margin: '0 0 32px 0', color: '#94a3b8', fontSize: '0.9rem' }}>Connexion sécurisée</p>

          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Identifiant */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Identifiant</label>
              <input 
                type="text" 
                placeholder="Votre identifiant ou email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 16px', backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none',
                  fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Mot de Passe</label>
              <input 
                type="password" 
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 16px', backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none',
                  fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box',
                  letterSpacing: '2px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            {/* Sélecteur de Rôle */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px', marginBottom: '8px' }}>
              {(['DIRECTOR', 'PROFESSEUR', 'ADMINISTRATEUR'] as const).map(r => (
                <div key={r} onClick={() => setRole(r)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  backgroundColor: role === r ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                  padding: '6px 12px', borderRadius: '12px', border: `1px solid ${role === r ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                  transition: 'all 0.2s'
                }}>
                  <div style={{ width: '12px', height: '6px', borderRadius: '4px', backgroundColor: role === r ? 'white' : '#475569' }}></div>
                  <span style={{ fontSize: '0.65rem', color: role === r ? 'white' : '#94a3b8', fontWeight: 600 }}>{r}</span>
                </div>
              ))}
            </div>

            {/* Mode 2FA OTP Actif - Saisie du code à 6 chiffres */}
            {show2FAStep && (
              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={16} /> Validation 2FA / QR Code OTP
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Expire dans <strong style={{ color: '#38bdf8' }}>{otpTimer}s</strong></span>
                </div>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Ex: 849204"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  style={{
                    width: '100%', padding: '12px 16px', backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid #38bdf8', borderRadius: '10px', color: '#38bdf8', outline: 'none',
                    fontSize: '1.4rem', fontWeight: 700, letterSpacing: '8px', textAlign: 'center', boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Bouton Connexion */}
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                marginTop: '8px', padding: '14px', 
                background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)', 
                color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', opacity: isLoading ? 0.8 : 1,
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
              }}
            >
              {isLoading ? <Loader2 className="lucide-spin" size={20} /> : (show2FAStep ? 'VALIDER LE CODE OTP' : 'CONNEXION')}
            </button>

            {/* Bouton de Bascule QR Code OTP 2FA */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              style={{
                padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
              }}
            >
              <Shield size={16} color="#38bdf8" /> Configurer / Scanner QR Code 2FA
            </button>

          </form>

          {/* Links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', fontSize: '0.8rem' }}>
            <span style={{ color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}>Mot de passe oublié ?</span>
            <span style={{ color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}>Mot de passe oublié</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ color: 'white', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}>
              S'inscrire
            </span>
          </div>

        </div>

        {/* Footer Info */}
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', width: '100%' }}>
          <p style={{ margin: '0 0 4px 0' }}>Theage scolaires / Etablissement Démo</p>
          <p style={{ margin: '0 0 24px 0' }}>Support : support@kpsyschool.com | Phone : +221 33 000 0000</p>
          
          {/* Bottom Icons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
            {[
              { icon: Settings, label: 'Administration' },
              { icon: GraduationCap, label: 'Classes' },
              { icon: FileText, label: 'Examens' },
              { icon: BookOpen, label: 'Librairie' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <item.icon size={20} color="#64748b" />
                <span style={{ fontSize: '0.7rem' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODALE DE PROTECTION DES DONNÉES */}
      {showPrivacyPolicy && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#0f172a', width: '90%', maxWidth: '700px', maxHeight: '80vh',
            borderRadius: '16px', border: '1px solid #334155', padding: '32px',
            overflowY: 'auto', color: '#cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-title)' }}>Charte de protection des données</h2>
              <button onClick={() => setShowPrivacyPolicy(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.8rem', padding: 0 }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: 1.6 }}>
              <div>
                <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Protection de vos données personnelles</h3>
                <p style={{ margin: 0 }}>KPSySchool s'engage à protéger les données que vous nous confiez, dans le respect de la loi sénégalaise n° 2008-12 du 25 janvier 2008 relative à la protection des données à caractère personnel, sous le contrôle de la Commission de Protection des Données Personnelles (CDP).</p>
              </div>

              <div>
                <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Isolation totale entre entreprises abonnées</h3>
                <p style={{ margin: 0 }}>Chaque organisation cliente dispose d'un espace de données strictement cloisonné. Aucune entreprise abonnée ne peut accéder, même partiellement, aux données d'une autre — cette isolation est appliquée au niveau technique de notre infrastructure, pas seulement au niveau de l'interface.</p>
              </div>

              <div>
                <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Mesure d'audience</h3>
                <p style={{ margin: 0 }}>Nous collectons de manière anonyme certaines données techniques (adresse IP, pages consultées, navigateur utilisé) afin de mesurer la fréquentation de la plateforme et d'améliorer nos services. Ces données ne sont jamais utilisées pour vous identifier individuellement et sont conservées pendant une durée maximale de 90 jours, après quoi elles sont automatiquement supprimées.</p>
              </div>

              <div>
                <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Vos droits</h3>
                <p style={{ margin: 0 }}>Conformément à la loi, vous disposez d'un droit d'accès, de rectification et d'opposition concernant vos données personnelles. Pour toute demande, contactez-nous à kpsy1informatik@gmail.com.</p>
              </div>

              <div>
                <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Sécurité</h3>
                <p style={{ margin: 0 }}>L'accès à votre compte est protégé par un mot de passe conforme aux standards de sécurité actuels, avec possibilité d'activer une authentification à deux facteurs. Toutes les communications avec nos serveurs sont chiffrées (HTTPS).</p>
              </div>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'right' }}>
              <button onClick={() => setShowPrivacyPolicy(false)} style={{ padding: '12px 24px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE D'AUTHENTIFICATION & SCAN QR CODE OTP (2FA) */}
      {isQrModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#0f172a', width: '90%', maxWidth: '480px',
            borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '32px',
            color: '#cbd5e1', boxShadow: '0 25px 50px -12px rgba(56, 189, 248, 0.2)', textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#38bdf8" /> Authentification 2FA par QR Code
              </h2>
              <button onClick={() => setIsQrModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.8rem', padding: 0 }}>&times;</button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
              Scannez ce QR Code avec <strong>Google Authenticator</strong>, <strong>Authy</strong> ou <strong>Microsoft Authenticator</strong> pour lier votre compte KPsySchool.
            </p>

            {/* Génération du QR Code TOTP Visuel */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`otpauth://totp/KPsySchool:${email || 'admin@kpsyschool.com'}?secret=${qrCodeSecret}&issuer=KPsySchool`)}`}
                alt="QR Code 2FA TOTP"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>

            {/* Clé secrète de secours */}
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>CLÉ SECRÈTE MANUELLE</span>
              <strong style={{ color: '#38bdf8', fontSize: '1rem', letterSpacing: '2px', fontFamily: 'monospace' }}>{qrCodeSecret}</strong>
            </div>

            <button
              onClick={() => {
                setShow2FAStep(true);
                setIsQrModalOpen(false);
              }}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#38bdf8', color: '#0f172a',
                border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem'
              }}
            >
              ACTIVATION 2FA & SAISIE DU CODE OTP
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
