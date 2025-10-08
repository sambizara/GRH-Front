// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api", // backend
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Assurez-vous que c'est le bon port
  timeout: 10000,
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Requête ${config.method?.toUpperCase()} vers: ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse ${response.status} de: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Erreur ${error.response?.status} de: ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;