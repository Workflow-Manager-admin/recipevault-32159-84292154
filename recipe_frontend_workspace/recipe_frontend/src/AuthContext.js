import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, logoutUser, getFavorites } from "./api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally: check if user session/token exists in localStorage here
    // On first load, set user/token from localStorage if present
    const stored = localStorage.getItem("rv_token");
    const storedUser = localStorage.getItem("rv_user");
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // On login, fetch favorite recipes
    if (token) {
      getFavorites(token)
        .then(data => setFavorites(data.favorites || []))
        .catch(() => setFavorites([]));
    } else {
      setFavorites([]);
    }
  }, [token]);

  // PUBLIC_INTERFACE
  const login = async (creds) => {
    setLoading(true);
    try {
      const res = await loginUser(creds);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("rv_token", res.token);
      localStorage.setItem("rv_user", JSON.stringify(res.user));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return { success: false, error: err?.response?.data?.detail || "Login failed" };
    }
  };

  // PUBLIC_INTERFACE
  const signup = async (creds) => {
    setLoading(true);
    try {
      await signupUser(creds);
      setLoading(false);
      return await login(creds);
    } catch (err) {
      setLoading(false);
      return { success: false, error: err?.response?.data?.detail || "Signup failed" };
    }
  };

  // PUBLIC_INTERFACE
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (e) {}
    setUser(null);
    setToken(null);
    setFavorites([]);
    localStorage.removeItem("rv_token");
    localStorage.removeItem("rv_user");
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      favorites,
      setFavorites,
      login,
      signup,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}
