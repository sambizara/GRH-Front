import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useContext(AuthContext);

  // 🔄 En cours de chargement
  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  // 🔒 Pas connecté → redirige vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Rôle non autorisé → redirige vers sa page par défaut
  if (roles && !roles.includes(user.role)) {
    switch(user.role) {
      case "ADMIN_RH":
        return <Navigate to="/admin/users" replace />;
      case "SALARIE":
        return <Navigate to="/salarie/profil" replace />;
      case "STAGIAIRE":
        return <Navigate to="/stagiaire/profil" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // ✅ Autorisé → affiche la page
  return children;
}