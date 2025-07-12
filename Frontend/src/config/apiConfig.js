// src/config/apiConfig.js

// Add your backend URLs here
const BACKEND_URLS = {
  localhost: "http://localhost:5000",
  campusadmin: "https://campusadmin-backend.vercel.app", // example, replace with real
  another: "https://another-backend.example.com",         // example, replace with real
};

// Logic to pick the right backend
export function getApiUrl() {
  // 1. If VITE_API_URL is set, always use it (for .env or deployment)
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // 2. Otherwise, use window.location.hostname to decide
  const host = window.location.hostname;
  console.log('Current hostname:', host);
  
  if (host === "localhost" || host === "127.0.0.1") {
    console.log('Using localhost backend:', BACKEND_URLS.localhost);
    return BACKEND_URLS.localhost;
  }
  if (host.includes("campusadmin")) {
    console.log('Using campusadmin backend:', BACKEND_URLS.campusadmin);
    return BACKEND_URLS.campusadmin;
  }
  // Add more logic as needed
  console.log('Using fallback backend:', BACKEND_URLS.another);
  return BACKEND_URLS.another; // fallback
} 