import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const linkStyle = {
    display: "block",
    padding: "10px 16px",
    color: "#ecf0f1",
    textDecoration: "none",
    borderRadius: "8px",
    marginBottom: "6px"
  };

  // const activeStyle = {
  //   backgroundColor: "#1abc9c"
  // };

  return (
    <aside style={{ width: "240px", background: "#2c3e50", color: "#fff", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-xl font-bold mb-6">📂 Menu</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {/* ================= ADMIN ================= */}
        {user.role === "ADMIN_RH" && (
          <>
            <li><Link to="/admin/dashboard" style={linkStyle}>🏠 Tableau de bord</Link></li>
            <li><Link to="/admin/users" style={linkStyle}>👥 Gestion utilisateurs</Link></li>
            <li><Link to="/admin/service" style={linkStyle}>🏢 Services</Link></li>
            <li><Link to="/admin/contrats" style={linkStyle}>📑 Contrats</Link></li>
            <li><Link to="/admin/conges" style={linkStyle}>📅 Congés</Link></li>
            <li><Link to="/admin/attestations" style={linkStyle}>📄 Attestations</Link></li>
            <li><Link to="/admin/rapports" style={linkStyle}>📘 Rapports</Link></li>
            <li><Link to="/admin/presence" style={linkStyle}>📋 Présences</Link></li>
          </>
        )}

        {/* ================= SALARIÉ ================= */}
        {user.role === "SALARIE" && (
          <>
            <li><Link to="/salarie/dashboard" style={linkStyle}>🏠 Mon tableau de bord</Link></li>
            <li><Link to="/salarie/profil" style={linkStyle}>🙍 Mon profil</Link></li>
            <li><Link to="/salarie/conges" style={linkStyle}>📅 Mes congés</Link></li>
            <li><Link to="/salarie/presence" style={linkStyle}>📋 Mes présences</Link></li>
            <li><Link to="/salarie/attestations" style={linkStyle}>📄 Mes attestations</Link></li>
            <li><Link to="/salarie/contrats" style={linkStyle}>📑 Mes contrats</Link></li>
          </>
        )}

        {/* ================= STAGIAIRE ================= */}
        {user.role === "STAGIAIRE" && (
          <>
            <li><Link to="/stagiaire/dashboard" style={linkStyle}>🏠 Mon tableau de bord</Link></li>
            <li><Link to="/stagiaire/profil" style={linkStyle}>🙍 Mon profil</Link></li>
            <li><Link to="/stagiaire/monstage" style={linkStyle}>🎓 Mon stage</Link></li>
            <li><Link to="/stagiaire/conges" style={linkStyle}>📅 Mes congés</Link></li>
            <li><Link to="/stagiaire/attestations" style={linkStyle}>📄 Mes attestations</Link></li>
            <li><Link to="/stagiaire/rapports" style={linkStyle}>📘 Mes rapports</Link></li>
          </>
        )}
      </ul>
    </aside>
  );
}
