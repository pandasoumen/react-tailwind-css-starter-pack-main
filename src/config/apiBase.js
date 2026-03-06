const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const fromEnv = () => {
  const url = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL;
  if (!url || typeof url !== "string") return null;
  const normalized = url.trim();
  return normalized ? trimTrailingSlash(normalized) : null;
};

const fromWindow = () => {
  if (typeof window === "undefined" || !window.location) return null;

  const { hostname } = window.location;
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";

  if (isLocal) return "http://localhost:4000/api";
  return null;
};

export const API_BASE_URL = fromEnv() || fromWindow() || null;

export const API_BASE_CONFIG_ERROR =
  "API base URL is not configured. Set REACT_APP_API_URL to your backend URL (for example: https://your-backend-domain/api).";

export const isApiBaseConfigured = () => Boolean(API_BASE_URL);
