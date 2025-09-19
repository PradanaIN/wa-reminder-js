import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/apiClient';

const TEMPLATE_QUERY_KEY = ['templates', 'message'];
const API_KEY = import.meta.env.VITE_CONTROL_API_KEY || '';

function withApiKey(options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  return {
    ...options,
    headers,
  };
}

function normalizeTemplateResponse(payload) {
  if (!payload) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object' && typeof payload.template === 'string') {
    return payload.template;
  }

  return '';
}

export function useTemplate() {
  return useQuery({
    queryKey: TEMPLATE_QUERY_KEY,
    queryFn: async () => {
      const response = await apiRequest('/api/templates', withApiKey());
      return normalizeTemplateResponse(response);
    },
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template) =>
      apiRequest(
        '/api/templates',
        withApiKey({
          method: 'POST',
          body: { template },
        })
      ),
    onSuccess: (_, template) => {
      queryClient.setQueryData(TEMPLATE_QUERY_KEY, template);
      queryClient.invalidateQueries({ queryKey: TEMPLATE_QUERY_KEY });
    },
  });
}

export { TEMPLATE_QUERY_KEY };
