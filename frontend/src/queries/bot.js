import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/apiClient';

const BOT_STATUS_KEY = ['bot', 'status'];

export function useBotStatus() {
  return useQuery({
    queryKey: BOT_STATUS_KEY,
    queryFn: () => apiRequest('/api/admin/bot/status'),
    refetchInterval: 30_000,
  });
}

export function useBotStart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest('/api/admin/bot/start', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOT_STATUS_KEY });
    },
  });
}

export function useBotStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest('/api/admin/bot/stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOT_STATUS_KEY });
    },
  });
}
