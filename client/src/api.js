import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Match the backend port
});

export default api;
