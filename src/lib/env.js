export const USE_MOCK = false;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

if (import.meta.env.DEV) {
  console.info(`%c[HaUI - DMS v3.0] Kết nối Backend: ${API_BASE_URL}`, 'color:#52C41A;font-weight:600');
}
