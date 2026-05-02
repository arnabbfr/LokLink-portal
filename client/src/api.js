import axios from 'axios';

const api = axios.create({
  // Use VITE_API_BASE_URL from environment variables, or fallback to localhost for development
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

export default api;
