import React, { createContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, motDePasse) => {
  setLoading(true);
  try {
    console.log("🔄 AuthContext - Tentative de connexion...");
    console.log("📤 Données envoyées:", { email, password: motDePasse }); // ← Changé ici
    
    const response = await api.post("/auth/login", {
      email,
      password: motDePasse, // ← ICI : motDePasse → password
    });

    console.log("✅ AuthContext - Réponse reçue:", response.data);
    
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setUser(response.data.user);

    return response.data;

  } catch (error) {
    console.error("❌ AuthContext - Erreur attrapée:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    
    return {
      token: null,
      message: error.response?.data?.message || "Erreur de connexion au serveur",
    };
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};