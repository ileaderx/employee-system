import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 5000, // optional: set a 5s timeout
});

// Attach token to requests
API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Handle errors globally
API.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Server is offline or unreachable
      alert("Server is offline or unreachable ❌");
    }
    return Promise.reject(error);
  }
);

export default API;
