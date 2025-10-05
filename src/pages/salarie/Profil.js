import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function ProfilSalarie() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const testAuth = async () => {
      try {
        setLoading(true);
        setDebugInfo("🔍 Début du diagnostic...\n");
        
        // 1. Vérifier le token dans localStorage
        const token = localStorage.getItem('token');
        setDebugInfo(prev => prev + `🔑 Token dans localStorage: ${token ? "PRÉSENT" : "ABSENT"}\n`);
        
        if (token) {
          setDebugInfo(prev => prev + `📏 Longueur du token: ${token.length} caractères\n`);
          
          // Décoder le token pour voir son contenu
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setDebugInfo(prev => prev + `📋 Contenu du token:\n${JSON.stringify(payload, null, 2)}\n`);
            
            // Vérifier si c'est "id" ou "userId"
            if (payload.id) {
              setDebugInfo(prev => prev + `✅ Token utilise "id": ${payload.id}\n`);
            } else if (payload.userId) {
              setDebugInfo(prev => prev + `⚠️ Token utilise "userId": ${payload.userId}\n`);
            } else {
              setDebugInfo(prev => prev + `❌ Aucun ID trouvé dans le token!\n`);
            }
          } catch (e) {
            setDebugInfo(prev => prev + `❌ Impossible de décoder le token: ${e.message}\n`);
          }
        }

        // 2. Vérifier les headers de la requête
        setDebugInfo(prev => prev + `\n🌐 Tentative vers /users/me...\n`);
        
        const response = await api.get("/users/me");
        
        setDebugInfo(prev => prev + `✅ Succès! Status: ${response.status}\n`);
        console.log("✅ Profil chargé:", response.data);
        setProfil(response.data);
        
      } catch (err) {
        console.error("❌ Erreur complète:", err);
        
        let errorDetails = `\n❌ Erreur lors de la requête:\n`;
        errorDetails += `📊 Status: ${err.response?.status || 'N/A'}\n`;
        errorDetails += `📝 Message: ${err.response?.data?.message || 'N/A'}\n`;
        errorDetails += `🔗 URL: ${err.config?.url || 'N/A'}\n`;
        
        if (err.response?.status === 401) {
          errorDetails += `💡 Solution: Déconnectez-vous et reconnectez-vous pour générer un nouveau token\n`;
        }
        
        setError(err.response?.data?.message || err.message);
        setDebugInfo(prev => prev + errorDetails);
      } finally {
        setLoading(false);
      }
    };
    
    testAuth();
  }, []);

  const handleReconnect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Non renseigné";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Mon Profil - Diagnostic</h1>
        <div style={{ 
          background: "#f8f9fa", 
          padding: "15px", 
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
          whiteSpace: "pre-wrap",
          marginBottom: "20px"
        }}>
          {debugInfo}
        </div>
        <p>Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Mon Profil - Erreur</h1>
        <div style={{ 
          background: "#f8f9fa", 
          padding: "15px", 
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
          whiteSpace: "pre-wrap",
          marginBottom: "20px"
        }}>
          {debugInfo}
        </div>
        
        <div style={{ 
          background: "#ffeaa7", 
          padding: "15px", 
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          <h3 style={{ color: "#e74c3c", marginTop: 0 }}>Solution recommandée:</h3>
          <p>Le problème vient probablement d'un token incompatible. Déconnectez-vous et reconnectez-vous pour générer un nouveau token avec la structure corrigée.</p>
          <button 
            onClick={handleReconnect}
            style={{
              background: "#e74c3c",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            🔄 Se déconnecter et réessayer
          </button>
        </div>
      </div>
    );
  }

  // ⭐⭐ CORRECTION : Ajout de la section d'affichage du profil quand tout fonctionne
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "32px" }}>👨‍💼</span>
        Mon Profil
      </h1>
      
      {/* Section debug réduite quand tout fonctionne */}
      <div style={{
        background: "#e3f2fd",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "20px",
        fontSize: "12px",
        color: "#1565c0"
      }}>
        ✅ Profil chargé avec succès via /users/me
      </div>

      {profil && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          {/* En-tête du profil */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "25px",
            marginBottom: "30px",
            paddingBottom: "20px",
            borderBottom: "1px solid #eee"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
              fontWeight: "bold"
            }}>
              {profil.nom?.charAt(0)}{profil.prenom?.charAt(0)}
            </div>
            
            <div>
              <h2 style={{ margin: "0 0 5px 0", color: "#2c3e50" }}>
                {profil.prenom} {profil.nom}
              </h2>
              <p style={{ margin: 0, color: "#7f8c8d" }}>
                {profil.role} • {profil.service?.nomService || "Non assigné"}
              </p>
              {profil.poste && (
                <p style={{ margin: "5px 0 0 0", color: "#3498db", fontSize: "14px" }}>
                  📋 {profil.poste}
                </p>
              )}
            </div>
          </div>

          {/* Informations personnelles */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Informations personnelles</h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: "15px" 
            }}>
              <div><strong>Email :</strong> {profil.email}</div>
              <div><strong>Sexe :</strong> {profil.sexe}</div>
              <div><strong>Date de naissance :</strong> {formatDate(profil.dateNaissance)}</div>
              <div><strong>Adresse :</strong> {profil.adresse}</div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Informations professionnelles</h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: "15px" 
            }}>
              <div><strong>Rôle :</strong> {profil.role}</div>
              <div><strong>Service :</strong> {profil.service?.nomService || "Non assigné"}</div>
              {profil.dateEmbauche && (
                <div><strong>Date d'embauche :</strong> {formatDate(profil.dateEmbauche)}</div>
              )}
              {profil.poste && (
                <div><strong>Poste :</strong> {profil.poste}</div>
              )}
            </div>
          </div>

          {/* Informations spécifiques aux stagiaires */}
          {profil.role === "STAGIAIRE" && (
            <div>
              <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Informations de stage</h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "15px" 
              }}>
                <div><strong>École :</strong> {profil.ecole}</div>
                <div><strong>Filière :</strong> {profil.filiere}</div>
                <div><strong>Niveau :</strong> {profil.niveau}</div>
                <div><strong>Date de début :</strong> {formatDate(profil.dateDebut)}</div>
                <div><strong>Date de fin :</strong> {formatDate(profil.dateFin)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}