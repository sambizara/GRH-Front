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
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Mettre à jour le header Authorization pour les requêtes futures
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => { // ← CORRECTION : motDePasse → password
    setLoading(true);
    try {
      console.log("🔄 AuthContext - Tentative de connexion...");
      console.log("📤 Données envoyées:", { email, password });
      
      const response = await api.post("/auth/login", {
        email,
        password, // ← CORRECTION : utilisation du bon nom
      });

      console.log("✅ AuthContext - Réponse reçue:", response.data);
      
      if (response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Mettre à jour le header Authorization
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setUser(response.data.user);

        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          message: "Connexion réussie"
        };
      } else {
        throw new Error("Réponse du serveur invalide");
      }

    } catch (error) {
      console.error("❌ AuthContext - Erreur attrapée:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Message:", error.message);
      
      return {
        success: false,
        token: null,
        user: null,
        message: error.response?.data?.message || "Erreur de connexion au serveur",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Ajoutez cette fonction à la fin de votre fichier AuthContext.js
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};