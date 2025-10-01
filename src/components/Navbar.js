import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirm(false);
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <header style={{
        background: "#2c3e50",
        padding: "15px 20px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "relative"
      }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>GRH - Système</h2>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span>
              Connecté en tant que <b>{user.role}</b>
            </span>
            <button 
              onClick={handleLogoutClick}
              style={{
                background: "#e74c3c",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background 0.3s ease"
              }}
              onMouseOver={(e) => e.target.style.background = "#c0392b"}
              onMouseOut={(e) => e.target.style.background = "#e74c3c"}
            >
              Déconnexion
            </button>
          </div>
        )}
      </header>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              background: "#fff3cd",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto"
            }}>
              <svg width="30" height="30" fill="#f39c12" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h3 style={{ 
              margin: "0 0 10px 0", 
              color: "#2c3e50",
              fontSize: "1.4rem"
            }}>
              Confirmer la déconnexion
            </h3>
            
            <p style={{ 
              color: "#7f8c8d",
              margin: "0 0 25px 0",
              lineHeight: "1.5"
            }}>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            
            <div style={{ 
              display: "flex", 
              gap: "12px",
              justifyContent: "center"
            }}>
              <button
                onClick={cancelLogout}
                style={{
                  background: "#95a5a6",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                  transition: "background 0.3s ease",
                  flex: 1
                }}
                onMouseOver={(e) => e.target.style.background = "#7f8c8d"}
                onMouseOut={(e) => e.target.style.background = "#95a5a6"}
              >
                Annuler
              </button>
              
              <button
                onClick={confirmLogout}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                  transition: "background 0.3s ease",
                  flex: 1
                }}
                onMouseOver={(e) => e.target.style.background = "#c0392b"}
                onMouseOut={(e) => e.target.style.background = "#e74c3c"}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}