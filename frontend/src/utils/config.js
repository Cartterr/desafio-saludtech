function getApiBaseUrl() {
  if (process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  const currentHost = window.location.hostname;
  const currentPort = window.location.port;

  if (currentHost.includes('ngrok')) {
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  if (currentPort === '3000') {
    return 'http://localhost:3001/api';
  }

  return `${window.location.protocol}//${window.location.host}/api`;
}

export const API_BASE = getApiBaseUrl();
