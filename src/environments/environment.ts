const runtime =
  typeof window !== 'undefined' && (window as any).__env__
    ? (window as any).__env__
    : { apiUrl: 'http://localhost:5000/api' };

export const environment = {
  production: false,
  apiUrl: runtime.apiUrl
};
