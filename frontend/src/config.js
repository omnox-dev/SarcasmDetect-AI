// API Configuration for different environments
const getAPIBaseURL = () => {
  // In production, use same Netlify domain (no CORS issues)
  if (import.meta.env.PROD) {
    return '';
  }
  // In development, use local backend
  return 'http://localhost:8000';
};

export const API_BASE_URL = getAPIBaseURL();
export default API_BASE_URL;