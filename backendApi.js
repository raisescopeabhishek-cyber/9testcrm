// src/api/backendApi.js
import axios from "axios";

const backendApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g., http://localhost:4000/api
  withCredentials: true,
  headers: {
    "x-api-key": import.meta.env.VITE_API_KEY,
  },
});


// Create Axios instance for meta api
export const metaApi = axios.create({
  baseURL: import.meta.env.VITE_META_API, // e.g., http://localhost:4000/api

});

export default backendApi;



