import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header if token exists
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
);

export const registerUser = async (userData) => {
  try {
    console.log("Registering user:", userData);
    const response = await authClient.post("/api/auth/register", userData);
    console.log("Register response:", response.data);
    
    // Save token if provided
    if (response.data.token) {
      localStorage.setItem("auth-token", response.data.token);
    }
    if (response.data.userId) {
      localStorage.setItem("user-id", response.data.userId);
    }
    
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message || "Registration failed");
  }
};

export const loginUser = async (credentials) => {
  try {
    console.log("Logging in user:", credentials);
    const response = await authClient.post("/api/auth/login", credentials);
    console.log("Login response:", response.data);
    
    // Save token and user data
    if (response.data.token) {
      localStorage.setItem("auth-token", response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem("user-data", JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.response?.data?.message || error.message || "Login failed");
  }
};

export const logoutUser = () => {
  localStorage.removeItem("auth-token");
  localStorage.removeItem("user-data");
  localStorage.removeItem("user-id");
  console.log("User logged out");
};

export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("user-data");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("auth-token");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("auth-token");
};
