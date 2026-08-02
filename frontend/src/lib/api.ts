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


// Intercepteur pour injecter automatiquement le Token et le Tenant ID
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
