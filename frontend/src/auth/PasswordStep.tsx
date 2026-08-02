import React, { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { api } from '../lib/api';

interface PasswordStepProps {
  onSuccess: (challengeId: string, email: string) => void;
  onRequireEnrollment: (enrollToken: string, email: string) => void;
  role: 'DIRECTOR' | 'PROFESSEUR' | 'ADMINISTRATEUR';
  setRole: (role: 'DIRECTOR' | 'PROFESSEUR' | 'ADMINISTRATEUR') => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({ onSuccess, onRequireEnrollment, role, setRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Appelle le véritable endpoint d'authentification platform
      const res = await api.post('/platform/auth/login', { email, pass: password });
      const resData = res.data;

      // Décision de Routage Sécurisé Serveur
      if (resData.status === 'mfa_enrollment_required' && resData.enroll_token) {
        onRequireEnrollment(resData.enroll_token, email);
      } else if (resData.status === 'otp_required' && resData.challenge_id) {
        onSuccess(resData.challenge_id, email);
      } else {
        setError("Identifiants invalides.");
      }
    } catch (apiErr: any) {
      const msg = apiErr?.response?.data?.message || 'Identifiants invalides.';
      setError(Array.isArray(msg) ? msg.join(' | ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', color: 'white', fontWeight: 600 }}>Bienvenue <span style={{ color: '#64748b', fontWeight: 400 }}>/ Welcome</span></h2>
      <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '0.9rem' }}>Connexion sécurisée — Étape 1/2</p>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {/* Identifiant */}
      <div>
        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Adresse Email</label>
        <input 
          type="email" 
          placeholder="votre.email@kpsyschool.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: '100%', padding: '12px 16px', backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none',
            fontSize: '0.95rem', boxSizing: 'border-box'
          }}
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
            fontSize: '0.95rem', boxSizing: 'border-box', letterSpacing: '2px'
          }}
        />
      </div>

      {/* Sélecteur de Rôle */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '4px 0' }}>
        {(['DIRECTOR', 'PROFESSEUR', 'ADMINISTRATEUR'] as const).map(r => (
          <div key={r} onClick={() => setRole(r)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            backgroundColor: role === r ? '#3b82f6' : 'rgba(255,255,255,0.05)',
            padding: '6px 12px', borderRadius: '12px', border: `1px solid ${role === r ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: role === r ? 'white' : '#475569' }}></div>
            <span style={{ fontSize: '0.65rem', color: role === r ? 'white' : '#94a3b8', fontWeight: 600 }}>{r}</span>
          </div>
        ))}
      </div>

      {/* Bouton Suivant */}
      <button 
        type="submit" 
        disabled={isLoading}
        style={{
          marginTop: '8px', padding: '14px', 
          background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)', 
          color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: isLoading ? 0.8 : 1, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
        }}
      >
        {isLoading ? <Loader2 className="lucide-spin" size={20} /> : 'SE CONNECTER'}
      </button>

      {/* Lien Inscription Nouvel Établissement */}
      <div style={{ textAlign: 'center', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <a 
          href="/signup"
          style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', cursor: 'pointer', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}
        >
          ➕ Inscrire mon Établissement Scolaire
        </a>

        <a 
          href="/activate-account"
          style={{ color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Vous avez reçu une invitation ? Activer mon compte
        </a>
      </div>
    </form>
  );
};
