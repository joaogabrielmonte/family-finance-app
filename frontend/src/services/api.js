import axios from 'axios';

const api = axios.create({
  baseURL: 'https://family-finance-app-two.vercel.app', // ✅ URL pública do backend na Vercel
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
