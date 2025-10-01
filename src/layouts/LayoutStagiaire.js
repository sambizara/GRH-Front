import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function LayoutStagiaire() {
  return (
      <div style={{ 
        display: "flex",
        minHeight: "100vh",
        width: "100%"
      }}>
        {/* Sidebar avec z-index bas */}
        <div style={{
          position: "relative",
          zIndex: 10
        }}>
          <Sidebar />
        </div>
        
        {/* Contenu principal */}
        <div style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          minWidth: 0 // ← Important pour le responsive
        }}>
          {/* Navbar avec z-index élevé */}
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 1000 // ← z-index élevé
          }}>
            <Navbar />
          </div>
          
          {/* Contenu de la page */}
          <main style={{ 
            padding: "20px",
            flex: "1",
            overflow: "auto"
          }}>
            <Outlet />
          </main>
        </div>
      </div>
    );
}
