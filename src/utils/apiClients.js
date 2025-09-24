import axios from "axios";
import API_CONFIG from "./apiConfig.js";

// Create Axios instance for backend api
export const backendApi = axios.create({

  baseURL: API_CONFIG.backendApi.baseURL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_CONFIG.backendApi.apiKey,
  },
  withCredentials: true, // Optional: only if your backend uses cookies/sessions
  
});

// Create Axios instance for meta api
export const metaApi = axios.create({
  baseURL: API_CONFIG.metaApi.baseURL,
});

export const copyApi = axios.create({
  baseURL: import.meta.env.VITE_COPY_BASE_URL,
});
