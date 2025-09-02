// src/api/axios.ts
import axios from "axios";

// .env dosyasındaki VITE_API_URL'i alıyoruz
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // <- bu olsun
  headers: { "Content-Type": "application/json" },
});

// İstek öncesi token ekleme (login sonrası için kullanacağız)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;