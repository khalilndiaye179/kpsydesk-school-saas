import axios from 'axios';
import { readStoredOrSeed, writeStored } from './storage';

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

/**
 * Lecture d'une ressource avec repli hors-ligne : le résultat de l'API est mis en
 * cache dans le localStorage, et en cas d'échec on relit ce cache (ou les données
 * de démonstration fournies).
 */
export async function fetchWithLocalFallback<T>(
  path: string,
  storageKey: string,
  fallback: T,
  transform?: (data: any) => T,
): Promise<T> {
  try {
    const response = await api.get(path);
    const data = transform ? transform(response.data) : (response.data as T);
    writeStored(storageKey, data);
    return data;
  } catch (err) {
    console.warn(`Erreur API ${path}, bascule sur les données locales :`, err);
    return readStoredOrSeed(storageKey, fallback);
  }
}
