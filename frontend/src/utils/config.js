function getApiBaseUrl() {
  if (window.location.hostname.includes('ngrok')) {
    return '/api';
  }
  return 'http://localhost:3001/api';
}

export const API_BASE = getApiBaseUrl();
