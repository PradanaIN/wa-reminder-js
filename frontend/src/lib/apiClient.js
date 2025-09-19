const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003').replace(/\/$/, '');

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
    config.body = typeof options.body === 'string'
      ? options.body
      : JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const text = await response.text();
  let payload = text;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Keep as plain text when JSON parsing fails
  }

  if (!response.ok) {
    const message = payload?.message || payload || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export { apiRequest, API_BASE_URL };
