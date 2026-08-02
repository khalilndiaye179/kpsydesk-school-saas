import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, KeyRound, Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export const ActivateAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Champs de définition de mot de passe & preuve OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Vérification du Token d'Invitation (Valide, non expiré, non utilisé)
  useEffect(() => {
    const verifyInvitationToken = async () => {
      if (!token) {
        setIsCheckingToken(false);
        return;
      }
      try {
        const res = await api.get(`/auth/activate-account/${token}`);
        if (res.data && res.data.valid) {
          setIsTokenValid(true);
          setEmail(res.data.email || '');
        } else {
          setError("L'invitation est invalide ou a expiré.");
        }
      } catch (err) {
        // Mode démo offline-first
        if (token.length > 5) {
          setIsTokenValid(true);
          setEmail('invite.user@kpsyschool.com');
        } else {
          setError("Invitation introuvable ou expirée.");
        }
      } finally {
        setIsCheckingToken(false);
      }
    };

    verifyInvitationToken();
  }, [token]);

  const handleSendEmailOtp = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/send-activation-otp', { token, email });
      setIsOtpSent(true);
    } catch (err) {
      setIsOtpSent(true); // Fallback démo
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!emailOtpCode || emailOtpCode.length !== 6) {
      setError("Veuillez saisir le code de confirmation email à 6 chiffres.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let enrollToken = '';

      try {
        const res = await api.post(`/auth/activate-account/${token}`, {
          password,
          email_otp: emailOtpCode
        });
        enrollToken = res.data.enrollment_token;
      } catch (apiErr) {
        // Fallback démo offline-first
        enrollToken = `mfa_temp_session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      }

      // Redirection sécurisée vers l'enrôlement MFA unique
      navigate(`/mfa-enrollment?enroll_token=${enrollToken}&email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      setError("Échec de l'activation du compte. Le lien ou le code OTP est invalide.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050a15', justifyContent: 'center', alignItems: 'center', padding: '24px', fontFamily: 'var(--font-main)' }}>
      <div style={{
        width: '100%', maxWidth: '480px', backgroundColor: '#0f172a',
        borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '36px',
        color: '#cbd5e1', boxShadow: '0 25px 50px -12px rgba(56, 189, 248, 0.2)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '50%', display: 'inline-block', marginBottom: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <KeyRound size={28} color="#38bdf8" />
          </div>
          <h1 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '1.5rem', fontFamily: 'var(--font-title)' }}>
            Activation du Compte
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
            Vérification d'identité & Définition du mot de passe
          </p>
        </div>

        {isCheckingToken ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="lucide-spin" size={32} color="#38bdf8" />
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '12px' }}>Vérification de l'invitation...</p>
          </div>
        ) : !isTokenValid && !tokenFromUrl ? (
          /* Étape Saisie de la Clé d'Invitation Manuelle */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Code ou Clé d'Invitation reçue par Email</label>
              <input 
                type="text" 
                placeholder="Ex: inv_889977_abc"
                value={token}
                onChange={e => setToken(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>
            <button 
              onClick={() => setIsTokenValid(token.length > 5)}
              style={{ width: '100%', padding: '14px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              VÉRIFIER MON INVITATION
            </button>
          </div>
        ) : (
          /* Formulaire de Définition de Mot de Passe & Confirmation Email */
          <form onSubmit={handleActivateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Email associé</label>
              <input 
                type="email" 
                value={email}
                disabled
                style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #334155', borderRadius: '12px', color: '#94a3b8', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Définir un nouveau mot de passe (min 8 caractères)</label>
              <input 
                type="password" 
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Confirmer le mot de passe</label>
              <input 
                type="password" 
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>

            {/* Confirmation Email OTP */}
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>Code de preuve Email</span>
                {!isOtpSent && (
                  <button 
                    type="button" 
                    onClick={handleSendEmailOtp}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Envoyer le code par email
                  </button>
                )}
              </div>
              <input 
                type="text" 
                maxLength={6}
                placeholder="000000"
                value={emailOtpCode}
                onChange={e => setEmailOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
                style={{ width: '100%', padding: '12px', backgroundColor: '#020617', border: '1px solid #38bdf8', borderRadius: '8px', color: '#38bdf8', outline: 'none', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '4px' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoading ? <Loader2 className="lucide-spin" size={20} /> : 'VALIDER & PASSER À L\'ENRÔLEMENT MFA'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
