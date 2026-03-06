import axios from "axios";
import { API_BASE_URL } from "../config/apiBase";

export const API = axios.create({
  baseURL: API_BASE_URL,
});
