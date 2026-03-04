import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BASE_URL ||
  "http://localhost:4000/api";

export const API = axios.create({
  baseURL: BASE_URL,
});
