function getApiBaseUrl() {
  if (process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  const currentHost = window.location.hostname;

  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }

  if (currentHost.includes('ngrok')) {
    const backendUrl = prompt(
      'Para usar ngrok, necesito la URL del backend.\n\n' +
      '1. Ejecuta: ngrok http 3001 en otra terminal\n' +
      '2. Copia la URL https que aparece\n' +
      '3. Pégala aquí (ejemplo: https://abc123.ngrok.app)\n\n' +
      'URL del backend:'
    );

    if (backendUrl && backendUrl.includes('ngrok')) {
      localStorage.setItem('ngrok_backend_url', backendUrl);
      return `${backendUrl}/api`;
    }

    const savedUrl = localStorage.getItem('ngrok_backend_url');
    if (savedUrl) {
      return `${savedUrl}/api`;
    }
  }

  return 'http://localhost:3001/api';
}

export const API_BASE = getApiBaseUrl();
