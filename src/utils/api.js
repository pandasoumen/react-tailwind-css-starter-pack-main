import axios from "axios";
import {
  API_BASE_URL,
  API_BASE_CONFIG_ERROR,
  isApiBaseConfigured,
} from "../config/apiBase";

export const API = axios.create({
  ...(API_BASE_URL ? { baseURL: API_BASE_URL } : {}),
});

API.interceptors.request.use((config) => {
  if (!isApiBaseConfigured()) {
    return Promise.reject(new Error(API_BASE_CONFIG_ERROR));
  }
  return config;
});
