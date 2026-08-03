import axios from 'axios';

// Instance Axios pour KPSyDesk School
// En production (school.kpsyinformatique.com), les appels /api/* passent par Nginx vers le backend.
// En développement local (localhost), on cible directement le port 8091.
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8091/api/v1'
  : '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});


// Intercepteur pour injecter automatiquement le Token et le Tenant ID si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kpsydesk_access_token');
  const tenantId = localStorage.getItem('kpsydesk_active_tenant_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepteur de réponse : Redirection /login SEULEMENT sur 401 avéré (Token réellement expiré/invalide)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config.url?.includes('/auth/login');
      // Rediriger uniquement si un token existait et a été rejeté comme invalide/expiré par le backend
      if (!isLoginRequest && localStorage.getItem('kpsydesk_access_token')) {
        console.warn('Session expiré ou token invalide. Redirection vers /login');
        localStorage.removeItem('kpsydesk_access_token');
        localStorage.removeItem('kpsydesk_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

