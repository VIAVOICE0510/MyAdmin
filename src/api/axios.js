import axios from "axios";

const api = axios.create({
  baseURL: "https://totivar.com/api/",
  // baseURL: "https://localhost:7291/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
