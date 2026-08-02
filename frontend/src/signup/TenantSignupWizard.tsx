import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, Smartphone, Check, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Lock, Sparkles, AlertTriangle } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { api } from '../lib/api';

export const TenantSignupWizard: React.FC = () => {
  const navigate = useNavigate();

  // Étape actuelle : 1 (École), 2 (Admin), 3 (Canal), 4 (OTP), 5 (Succès)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Écran 1 : Infos Établissement
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'TRIAL_7D' | 'STANDARD' | 'PREMIUM' | 'PRO' | 'ENTERPRISE'>('STANDARD');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  // Écran 2 : Infos Administrateur
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [country, setCountry] = useState('SN');
  const [jobTitle, setJobTitle] = useState('Directeur');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Écran 3 : Canal choisi (Email uniquement, SMS désactivé)
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms'>('email');

  // Écran 4 : Saisie OTP
  const [otpCode, setOtpCode] = useState('');
  const [signupId, setSignupId] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 minutes
  const [resendCooldown, setResendCooldown] = useState(0);

  // États globaux
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Génération automatique du sous-domaine
  useEffect(() => {
    if (schoolName) {
      const slug = schoolName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSubdomain(slug);
    }
  }, [schoolName]);

  // Validation du téléphone en temps réel avec libphonenumber-js
  useEffect(() => {
    if (!phoneRaw) {
      setPhoneError('');
      setNormalizedPhone('');
      return;
    }

    try {
      const parsed = parsePhoneNumberFromString(phoneRaw, country as any);
      if (parsed && parsed.isValid()) {
        setNormalizedPhone(parsed.format('E.164'));
        setPhoneError('');
      } else {
        setNormalizedPhone('');
        setPhoneError(`Format invalide pour le pays sélectionné (${country}). Ex Sénégal: 77 123 45 67`);
      }
    } catch (err) {
      setPhoneError("Numéro de téléphone invalide.");
      setNormalizedPhone('');
    }
  }, [phoneRaw, country]);

  // Compte à rebours 15 min OTP
  useEffect(() => {
    let interval: any;
    if (step === 4 && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Cooldown du renvoi d'OTP
  useEffect(() => {
    let interval: any;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Validation Écran 1
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      setGeneralError("Veuillez saisir le nom de votre établissement.");
      return;
    }
    setGeneralError('');
    setStep(2);
  };

  // Validation Écran 2
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setPasswordError('');

    if (!firstName || !lastName || !email || !phoneRaw || !password) {
      setGeneralError("Tous les champs sont obligatoires.");
      return;
    }

    if (phoneError || !normalizedPhone) {
      setGeneralError("Veuillez corriger le numéro de téléphone.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    setStep(3);
  };

  // Soumission à l'Écran 3 : Envoi du code OTP et création temporaire PendingSignup
  const handleRequestVerification = async () => {
    if (selectedChannel === 'sms') {
      setGeneralError("Le canal SMS n'est pas encore disponible. Veuillez sélectionner le canal Email.");
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      const res = await api.post('/tenants/signup/request-verification', {
        schoolName,
        subdomain,
        plan: selectedPlan,
        billingCycle,
        firstName,
        lastName,
        email,
        phone: normalizedPhone,
        country,
        jobTitle,
        password,
        verificationChannel: 'email'
      });

      setSignupId(res.data.signupId);
      setAttemptsLeft(5);
      setTimerSeconds(900);
      setResendCooldown(45);
      setStep(4);
    } catch (err: any) {
      // AUCUN fallback silencieux : affichage de l'erreur et blocage
      const message = err?.response?.data?.message
        || err?.message
        || "Une erreur est survenue lors de l'envoi du code de vérification. Vérifiez votre connexion et réessayez.";
      setGeneralError(Array.isArray(message) ? message.join(' | ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation OTP à l'Écran 4 : Création REELLE en BDD
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setGeneralError("Le code OTP doit contenir exactement 6 chiffres.");
      return;
    }
    if (!signupId) {
      setGeneralError("Session d'inscription invalide. Veuillez recommencer depuis le début.");
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      const res = await api.post('/tenants/signup/verify', {
        signupId,
        email,
        otpCode
      });

      // Notifier la Console SuperAdmin qu'un nouveau tenant vient d'être créé
      // FleetView lira cette clé au montage et affichera un bandeau d'alerte
      localStorage.setItem('kpsydesk_new_signup_created', JSON.stringify({
        schoolName,
        email,
        subdomain,
        plan: selectedPlan,
        createdAt: new Date().toISOString(),
        tenantId: res?.data?.tenantId ?? null,
      }));

      setStep(5);

    } catch (err: any) {
      // AUCUN fallback silencieux : affichage de l'erreur et blocage
      const message = err?.response?.data?.message
        || err?.message
        || 'Code OTP invalide ou expiré. Veuillez réessayer.';
      const finalMessage = Array.isArray(message) ? message.join(' | ') : message;
      setGeneralError(finalMessage);
      
      // Mettre à jour les tentatives restantes si l'erreur le précise
      if (finalMessage.includes('tentative')) {
        setAttemptsLeft(prev => Math.max(0, prev - 1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoi d'OTP
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setGeneralError('');

    try {
      await api.post('/tenants/signup/resend-code', { signupId, email });
      setResendCooldown(45);
      setGeneralError('');
      alert("Un nouveau code OTP a été envoyé à votre adresse email.");
    } catch (err: any) {
      const message = err?.response?.data?.message
        || err?.message
        || "Impossible de renvoyer le code OTP. Veuillez réessayer.";
      setGeneralError(Array.isArray(message) ? message.join(' | ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const plans = [
    { 
      id: 'STANDARD', 
      name: 'Plan Standard', 
      monthlyPrice: '25 000 FCFA / mois',
      annualPrice: '180 000 FCFA / an',
      annualSubtext: 'soit 20 000 F/m (-20% sur 9 mois)',
      badge: 'Populaire', 
      desc: 'Gestion essentielle : élèves, classes, absences, bulletins & pointage kiosque.' 
    },
    { 
      id: 'PREMIUM', 
      name: 'Plan Premium', 
      monthlyPrice: '50 000 FCFA / mois',
      annualPrice: '360 000 FCFA / an',
      annualSubtext: 'soit 40 000 F/m (-20% sur 9 mois)',
      badge: 'Recommandé', 
      desc: 'Gestion complète : RH, comptabilité, messagerie parents & statistiques avancées.' 
    },
    { 
      id: 'PRO', 
      name: 'Plan Pro', 
      monthlyPrice: '75 000 FCFA / mois',
      annualPrice: '540 000 FCFA / an',
      annualSubtext: 'soit 60 000 F/m (-20% sur 9 mois)',
      badge: 'Haute Performance', 
      desc: 'Multi-établissements, exports illimités, priorité support & API personnalisée.' 
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050a15', justifyContent: 'center', alignItems: 'center', padding: '24px', fontFamily: 'var(--font-main)' }}>
      <div style={{ width: '100%', maxWidth: '640px', backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '36px', color: '#cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* En-tête Wizard */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '12px' }}>
            <Building2 size={20} color="#38bdf8" />
            <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}>Création de Compte Établissement</span>
          </div>
          <h1 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: 700 }}>
            {step === 1 && "Étape 1 : Votre Établissement"}
            {step === 2 && "Étape 2 : Administrateur Principal"}
            {step === 3 && "Canal de Vérification Sécurisée"}
            {step === 4 && "Vérification OTP par Email"}
            {step === 5 && "Félicitations ! Compte Créé"}
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
            {step === 1 && "Renseignez le nom de votre école et choisissez votre offre."}
            {step === 2 && "Définissez les identifiants du Directeur ou Fondateur du compte."}
            {step === 3 && "Sélectionnez le moyen de réception de votre code de confirmation."}
            {step === 4 && `Saisissez le code à 6 chiffres envoyé à ${email}`}
            {step === 5 && "Votre établissement et votre espace administrateur sont prêts."}
          </p>
        </div>

        {/* Indicateur d'étapes */}
        {step <= 4 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: step === s ? '#38bdf8' : step > s ? '#10b981' : '#1e293b',
                  color: step === s || step > s ? '#0f172a' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem',
                  border: `2px solid ${step === s ? '#38bdf8' : step > s ? '#10b981' : '#334155'}`
                }}>
                  {step > s ? <Check size={18} /> : s}
                </div>
                <span style={{ fontSize: '0.7rem', color: step >= s ? 'white' : '#64748b', fontWeight: 500 }}>
                  {s === 1 ? 'École' : s === 2 ? 'Admin' : s === 3 ? 'Canal' : 'OTP'}
                </span>
              </div>
            ))}
          </div>
        )}

        {generalError && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> {generalError}
          </div>
        )}

        {/* ÉCRAN 1 : ÉTABLISSEMENT */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Nom de l'Établissement Scolaire *</label>
              <input 
                type="text" 
                placeholder="ex: Lycée d'Excellence de Dakar"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.95rem' }}
              />
              {subdomain && (
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '6px', display: 'block' }}>
                  Adresse dédiée : <strong>https://{subdomain}.school.kpsyinformatique.com</strong>
                </span>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Choisissez votre Offre / Plan *</label>
                
                {/* Switcher Mensuel / Annuel */}
                <div style={{ backgroundColor: '#020617', padding: '4px', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('MONTHLY')}
                    style={{
                      padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: billingCycle === 'MONTHLY' ? '#38bdf8' : 'transparent',
                      color: billingCycle === 'MONTHLY' ? '#0f172a' : '#94a3b8'
                    }}
                  >
                    Mensuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('ANNUAL')}
                    style={{
                      padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: billingCycle === 'ANNUAL' ? '#10b981' : 'transparent',
                      color: billingCycle === 'ANNUAL' ? '#0f172a' : '#94a3b8',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    Annuel (9 mois) <span style={{ backgroundColor: '#0f172a', color: '#10b981', padding: '1px 5px', borderRadius: '6px', fontSize: '0.65rem' }}>-20%</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {plans.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id as any)}
                    style={{
                      padding: '14px', borderRadius: '14px', cursor: 'pointer',
                      backgroundColor: selectedPlan === p.id ? 'rgba(56, 189, 248, 0.1)' : '#020617',
                      border: `2px solid ${selectedPlan === p.id ? '#38bdf8' : '#1e293b'}`,
                      transition: 'all 200ms ease',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ color: 'white', fontSize: '0.85rem' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.6rem', backgroundColor: selectedPlan === p.id ? '#38bdf8' : '#334155', color: selectedPlan === p.id ? '#0f172a' : 'white', padding: '2px 5px', borderRadius: '4px', fontWeight: 700 }}>{p.badge}</span>
                      </div>
                      
                      <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
                        {billingCycle === 'ANNUAL' ? p.annualPrice : p.monthlyPrice}
                      </div>
                      
                      {billingCycle === 'ANNUAL' && (
                        <div style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 600, marginBottom: '8px' }}>
                          {p.annualSubtext}
                        </div>
                      )}

                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0, lineHeight: '1.3' }}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '14px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
            >
              SUIVANT : INFOS ADMINISTRATEUR <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* ÉCRAN 2 : ADMINISTRATEUR */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '4px' }}>Prénom *</label>
                <input 
                  type="text" placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} required
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '4px' }}>Nom *</label>
                <input 
                  type="text" placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)} required
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '4px' }}>Adresse Email Profesionnelle *</label>
              <input 
                type="email" placeholder="directeur@ecole.com" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '10px 14px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '4px' }}>Pays *</label>
                <select 
                  value={country} onChange={e => setCountry(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white', outline: 'none' }}
                >
                  <option value="SN">🇸🇳 Sénégal (+221)</option>
                  <option value="CI">🇨🇮 Côte d'Ivoire (+225)</option>
                  <option value="ML">🇲🇱 Mali (+223)</option>
                  <option value="GN">🇬🇳 Guinée (+224)</option>
                  <option value="FR">🇫🇷 France (+33)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '4px' }}>Téléphone Mobile *</label>
                <input 
                  type="tel" placeholder="77 123 45 67" value={phoneRaw} onChange={e => setPhoneRaw(e.target.value)} required
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#020617', border: `1px solid ${phoneError ? '#ef4444' : normalizedPhone ? '#10b981' : '#334155'}`, borderRadius: '10px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>
            {phoneError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{phoneError}</span>}
            {normalizedPhone && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>Format international validé : {normalizedPhone}</span>}

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '4px' }}>Poste Occupé *</label>
              <select 
                value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white', outline: 'none' }}
              >
                <option value="Directeur">Directeur Général / Proviseur</option>
                <option value="Censeur">Censeur / Directeur des Études</option>
                <option value="Fondateur">Fondateur / Promoteur</option>
                <option value="Responsable IT">Responsable Système d'Information</option>
                <option value="Comptable">Gestionnaire Financier</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '4px' }}>Mot de Passe (min 8 car.) *</label>
                <input 
                  type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '4px' }}>Confirmation *</label>
                <input 
                  type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>
            {passwordError && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{passwordError}</span>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                type="button" onClick={() => setStep(1)}
                style={{ width: '35%', padding: '14px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> RETOUR
              </button>
              <button 
                type="submit" 
                style={{ width: '65%', padding: '14px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                CHOISIR LE CANAL <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* ÉCRAN 3 : CHOIX DU CANAL (Email Actif, SMS "Bientôt disponible") */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Option Email (Actif) */}
              <div 
                onClick={() => setSelectedChannel('email')}
                style={{
                  padding: '18px', borderRadius: '16px', cursor: 'pointer',
                  backgroundColor: selectedChannel === 'email' ? 'rgba(56, 189, 248, 0.1)' : '#020617',
                  border: `2px solid ${selectedChannel === 'email' ? '#38bdf8' : '#1e293b'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', padding: '10px', borderRadius: '12px' }}>
                    <Mail size={24} color="#38bdf8" />
                  </div>
                  <div>
                    <strong style={{ color: 'white', display: 'block', fontSize: '1rem' }}>Vérification par Email</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Un code à 6 chiffres sera envoyé à <strong>{email}</strong></span>
                  </div>
                </div>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #38bdf8', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} color="#0f172a" />
                </div>
              </div>

              {/* Option SMS (Désactivé avec badge "Bientôt disponible") */}
              <div 
                style={{
                  padding: '18px', borderRadius: '16px', opacity: 0.6, cursor: 'not-allowed',
                  backgroundColor: '#020617', border: '1px solid #1e293b',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)', padding: '10px', borderRadius: '12px' }}>
                    <Smartphone size={24} color="#64748b" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#94a3b8', fontSize: '1rem' }}>Vérification par SMS</strong>
                      <span style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                        Bientôt disponible
                      </span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Envoi sur le mobile {normalizedPhone || phoneRaw}</span>
                  </div>
                </div>
                <Lock size={18} color="#64748b" />
              </div>

            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                type="button" onClick={() => setStep(2)}
                style={{ width: '35%', padding: '14px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> RETOUR
              </button>
              <button 
                type="button" 
                onClick={handleRequestVerification}
                disabled={isLoading}
                style={{ width: '65%', padding: '14px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? <Loader2 className="lucide-spin" size={20} /> : <>ENVOYER LE CODE OTP <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ÉCRAN 4 : SAISIE OTP EMAIL */}
        {step === 4 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '16px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CODE ENVOYÉ À L'ADRESSE :</span>
              <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>{email}</strong>
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#eab308' }}>
                ⏱️ Temps restant : <strong>{formatTimer(timerSeconds)}</strong> | Essais restants : <strong>{attemptsLeft}/5</strong>
              </div>
            </div>

            {/* Code OTP envoyé à l'adresse */}

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Saisissez le code à 6 chiffres</label>
              <input 
                type="text" 
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
                style={{ width: '100%', padding: '14px', backgroundColor: '#020617', border: '2px solid #38bdf8', borderRadius: '12px', color: '#38bdf8', outline: 'none', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '8px', textAlign: 'center' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || attemptsLeft === 0 || timerSeconds === 0}
              style={{ width: '100%', padding: '14px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
            >
              {isLoading ? <Loader2 className="lucide-spin" size={20} /> : 'VALIDER ET CRÉER MON COMPTE'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <button 
                type="button" onClick={() => setStep(3)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Changer de canal
              </button>
              <button 
                type="button" 
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#64748b' : '#38bdf8', fontSize: '0.8rem', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                {resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : "Renvoyer le code par email"}
              </button>
            </div>
          </form>
        )}

        {/* ÉCRAN 5 : SUCCÈS & CONFIRMATION */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%', display: 'inline-block', marginBottom: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <CheckCircle2 size={56} color="#10b981" />
            </div>
            <h2 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.5rem' }}>Bienvenue sur KPSyDesk School !</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
              L'établissement <strong>{schoolName}</strong> a été créé avec succès. Un email de confirmation a été envoyé à <strong>{email}</strong>.
            </p>

            <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'left', marginBottom: '28px' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>VOTRE ADRESSE DE CONNEXION DÉDIÉE :</span>
              <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>https://{subdomain}.school.kpsyinformatique.com</strong>
            </div>

            <button 
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
            >
              SE CONNECTER À VOTRE ESPACE ADMIN
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
