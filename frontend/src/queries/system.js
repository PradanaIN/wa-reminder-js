import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/apiClient';

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => apiRequest('/api/system/health'),
    refetchInterval: 30_000,
  });
}

export function useLogs(limit = 100) {
  return useQuery({
    queryKey: ['system', 'logs', limit],
    queryFn: () => apiRequest(`/api/system/logs?limit=${limit}`),
    refetchInterval: 15_000,
  });
}

export function useSystemStats() {
  return {
    ...useQuery({
      queryKey: ['system', 'stats'],
      queryFn: () => apiRequest('/api/system/stats'),
      refetchInterval: 60_000,
    }),
  };
}
