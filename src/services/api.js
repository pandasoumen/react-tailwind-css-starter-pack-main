import axios from "axios";
import {
  API_BASE_URL,
  API_BASE_CONFIG_ERROR,
  isApiBaseConfigured,
} from "../config/apiBase";

const api = axios.create({
  ...(API_BASE_URL ? { baseURL: API_BASE_URL } : {}),
});

api.interceptors.request.use((config) => {
  if (!isApiBaseConfigured()) {
    return Promise.reject(new Error(API_BASE_CONFIG_ERROR));
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
