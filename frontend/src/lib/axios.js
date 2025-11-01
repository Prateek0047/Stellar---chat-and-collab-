import axios from "axios";

// Use relative URLs - nginx will proxy to backend
const BASE_URL = "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

console.log("🔗 API Base URL:", BASE_URL);
