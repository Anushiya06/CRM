import React, { createContext, useState, useEffect } from "react";
import api from "../api";

// Create context for authentication state
export const AuthContext = createContext();

// Provider component to wrap the application
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("crm_token");
    const storedUser = localStorage.getItem("crm_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Handle user login
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: jwtToken, user: userData } = response.data;

    localStorage.setItem("crm_token", jwtToken);
    localStorage.setItem("crm_user", JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  // Handle user registration
  const register = async (name, email, password, role) => {
    const response = await api.post("/auth/register", { name, email, password, role });
    const { token: jwtToken, user: userData } = response.data;

    localStorage.setItem("crm_token", jwtToken);
    localStorage.setItem("crm_user", JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
