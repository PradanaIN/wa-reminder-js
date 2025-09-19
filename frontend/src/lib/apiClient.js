const DEFAULT_API_PORT = 3301;

function resolveDefaultBaseUrl() {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
  }
  return `http://localhost:${DEFAULT_API_PORT}`;
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || resolveDefaultBaseUrl();
const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const config = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body !== undefined) {
    config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const text = await response.text();
  let payload = text;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // keep plain text on parse errors
  }

  if (!response.ok) {
    const message = payload?.message || payload || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export { apiRequest, API_BASE_URL };
