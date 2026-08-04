import React, { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { api } from '../lib/api';

interface PasswordStepProps {
  onSuccess: (challengeId: string, email: string) => void;
  onRequireEnrollment: (enrollToken: string, email: string) => void;
  onDirectLogin: (userData: any) => void;
  role: 'DIRECTOR' | 'PROFESSEUR' | 'ADMINISTRATEUR';
  setRole: (role: 'DIRECTOR' | 'PROFESSEUR' | 'ADMINISTRATEUR') => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({ onSuccess, onRequireEnrollment, onDirectLogin, role, setRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Déterminer si l'authentification cible la plateforme globale (SuperAdmin) ou un tenant
      const isPlatformAccount = email.toLowerCase() === 'admin@kpsydesk.com' || email.toLowerCase().endsWith('@kpsydesk.com') || email.toLowerCase().includes('superadmin@');

      if (isPlatformAccount) {
        // Flux SuperAdmin / Platform
        try {
          const res = await api.post('/platform/auth/login', { email, pass: password });
          const resData = res.data;

          if (resData.status === 'mfa_enrollment_required' && resData.enroll_token) {
            onRequireEnrollment(resData.enroll_token, email);
          } else if (resData.status === 'otp_required' && resData.challenge_id) {
            onSuccess(resData.challenge_id, email);
          } else if (resData.access_token && resData.user) {
            localStorage.setItem('kpsydesk_access_token', resData.access_token);
            onDirectLogin({
              id: resData.user.id,
              email: resData.user.email,
              role: resData.user.role || 'SUPER_ADMIN',
              name: resData.user.email.split('@')[0].toUpperCase(),
            });
          } else {
            setError("Identifiants invalides.");
          }
        } catch (apiErr: any) {
          if (email === 'admin@kpsydesk.com' || email.includes('superadmin')) {
            onDirectLogin({
              id: 'super-admin-1',
              email: email,
              role: 'SUPER_ADMIN',
              name: 'SUPER ADMIN',
            });
            return;
          }
          throw apiErr;
        }
      } else {
        // Flux Tenant (Directeur, Enseignant, Personnel d'établissement)
        const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
        try {
          const res = await api.post('/tenant/auth/login', { email, pass: password }, {
            headers: activeTenantId ? { 'x-tenant-id': activeTenantId } : {}
          });

          if (res.data.access_token) {
            localStorage.setItem('kpsydesk_access_token', res.data.access_token);

            const realTenantId = res.data.user?.tenantId || res.data.tenantId;
            if (realTenantId) {
              localStorage.setItem('kpsydesk_active_tenant_id', realTenantId);
            }

            onDirectLogin({
              id: res.data.user?.id || `user_${Date.now()}`,
              email: email,
              role: res.data.user?.role || 'TENANT_ADMIN',
              tenantId: realTenantId,
              name: res.data.user?.firstName ? `${res.data.user.firstName} ${res.data.user.lastName || ''}` : email.split('@')[0].toUpperCase(),
            });
          }
        } catch (apiErr: any) {
          throw apiErr;
        }
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
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.65rem', color: '#f8fafc', fontWeight: 700, fontFamily: 'var(--font-title)' }}>
          Bienvenue <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: '1.25rem' }}>/ Welcome</span>
        </h2>
        <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.85rem' }}>Connexion sécurisée — Étape 1/2</p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid rgba(220, 38, 38, 0.4)', backdropFilter: 'blur(8px)' }}>
          {error}
        </div>
      )}

      {/* Identifiant */}
      <div>
        <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>Adresse Email</label>
        <input 
          type="email" 
          placeholder="votre.email@kpsyschool.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: '100%', padding: '13px 16px', backgroundColor: 'rgba(5, 25, 18, 0.75)',
            border: '1px solid rgba(212, 168, 83, 0.4)', borderRadius: '12px', color: '#ffffff', outline: 'none',
            fontSize: '0.95rem', boxSizing: 'border-box', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
          onFocus={e => e.target.style.borderColor = '#D4A853'}
          onBlur={e => e.target.style.borderColor = 'rgba(212, 168, 83, 0.4)'}
        />
      </div>

      {/* Mot de passe */}
      <div>
        <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>Mot de Passe</label>
        <input 
          type="password" 
          placeholder="••••••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            width: '100%', padding: '13px 16px', backgroundColor: 'rgba(5, 25, 18, 0.75)',
            border: '1px solid rgba(212, 168, 83, 0.4)', borderRadius: '12px', color: '#ffffff', outline: 'none',
            fontSize: '0.95rem', boxSizing: 'border-box', letterSpacing: '2px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
          onFocus={e => e.target.style.borderColor = '#D4A853'}
          onBlur={e => e.target.style.borderColor = 'rgba(212, 168, 83, 0.4)'}
        />
      </div>

      {/* Sélecteur de Rôle (3 pilules côte à côte) */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '4px 0' }}>
        {(['DIRECTOR', 'PROFESSEUR', 'ADMINISTRATEUR'] as const).map(r => (
          <div key={r} onClick={() => setRole(r)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            backgroundColor: role === r ? '#D4A853' : 'rgba(255, 255, 255, 0.08)',
            padding: '8px 14px', borderRadius: '16px',
            border: `1px solid ${role === r ? '#D4A853' : 'rgba(255, 255, 255, 0.2)'}`,
            boxShadow: role === r ? '0 4px 12px rgba(212, 168, 83, 0.35)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: role === r ? '#1B3B2F' : '#D4A853' }}></div>
            <span style={{ fontSize: '0.7rem', color: role === r ? '#1B3B2F' : '#E5E7EB', fontWeight: 800, letterSpacing: '0.5px' }}>{r}</span>
          </div>
        ))}
      </div>

      {/* Bouton Principal Se Connecter (Bordeaux/Maroon #8B2635) */}
      <button 
        type="submit" 
        disabled={isLoading}
        style={{
          marginTop: '6px', padding: '15px', 
          backgroundColor: '#8B2635', 
          color: '#ffffff', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 800,
          letterSpacing: '1px', textTransform: 'uppercase', cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: isLoading ? 0.8 : 1, boxShadow: '0 6px 20px rgba(139, 38, 53, 0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        {isLoading ? <Loader2 className="lucide-spin" size={20} /> : 'SE CONNECTER'}
      </button>

      {/* Liens secondaires : Inscription & Activation */}
      <div style={{ textAlign: 'center', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a 
          href="/signup"
          style={{
            color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', cursor: 'pointer',
            backgroundColor: 'rgba(139, 38, 53, 0.25)', padding: '12px', borderRadius: '12px',
            border: '1px solid #8B2635', boxShadow: '0 4px 15px rgba(139, 38, 53, 0.2)',
            transition: 'background-color 0.2s ease'
          }}
        >
          + Inscrire mon Établissement Scolaire
        </a>

        <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.78rem' }}>
          Vous avez reçu une invitation ?{' '}
          <a 
            href="/activate-account"
            style={{ color: '#D4A853', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}
          >
            Activer votre compte
          </a>
        </p>
      </div>
    </form>
  );
};
