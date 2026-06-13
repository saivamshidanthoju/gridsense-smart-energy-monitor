import { createContext, useState, useCallback, useEffect } from "react";
import { loginUser as apiLogin, registerUser as apiRegister, logoutUser as apiLogout, getCurrentUser, isAuthenticated, getAuthToken } from "../services/authApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getCurrentUser();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    
    setIsInitialized(true);
  }, []);

  const login = useCallback(async (email, meterId, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("AuthContext: Login attempt");
      const response = await apiLogin({ email, meterId, password });
      
      setToken(response.token);
      setUser(response.user);
      
      console.log("AuthContext: Login successful", response.user);
      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      console.error("AuthContext: Login failed", errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, meterId, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("AuthContext: Registration attempt");
      const response = await apiRegister({ name, email, meterId, password });
      
      // After registration, login automatically
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
      }
      
      console.log("AuthContext: Registration successful");
      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      console.error("AuthContext: Registration failed", errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setToken(null);
    setError(null);
    console.log("AuthContext: User logged out");
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isInitialized,
    isAuthenticated: isAuthenticated(),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
