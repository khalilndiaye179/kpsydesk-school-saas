import axios from 'axios';

// Instance Axios pour KPSyDesk School
export const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  timeout: 10000,
});

// Intercepteur pour injecter automatiquement le Token et le Tenant ID
api.interceptors.request.use((config) => {
  // Dans un cas réel, on lirait le token depuis un AuthContext ou localStorage
  const token = localStorage.getItem('kpsydesk_access_token') || 'fake-jwt-token-tenant';
  
  // Simulation de la sélection d'école pour le multi-tenant
  const tenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '39b8b0e8-1111-4444-a1a1-9b1979b00001';

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
