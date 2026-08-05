import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';

interface UseRealtimeOptions {
  /** Intervalle de polling en ms (défaut: 30 000 = 30s) */
  interval?: number;
  /** Lancer immédiatement au montage */
  immediate?: boolean;
}

/**
 * Hook générique de polling temps réel pour les données de la console SuperAdmin.
 * Rafraîchit automatiquement les données à intervalle régulier.
 */
export function useRealtime<T>(
  endpoint: string,
  options: UseRealtimeOptions = {}
) {
  const { interval = 30_000, immediate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get(endpoint);
      setData(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (immediate) fetch();

    intervalRef.current = setInterval(fetch, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch, interval, immediate]);

  return { data, loading, error, lastUpdated, refresh: fetch };
}
