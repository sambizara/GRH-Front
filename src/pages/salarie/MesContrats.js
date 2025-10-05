import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MesContrats() {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContrats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔄 Chargement des contrats...");
        const res = await api.get("/contrats/mes/contrats");
        
        console.log("✅ Réponse contrats:", res.data);
        
        // Vérifiez la structure d'un contrat
        if (res.data.contrats && res.data.contrats.length > 0) {
          console.log("📊 Structure du premier contrat:", res.data.contrats[0]);
          console.log("👤 Structure user:", res.data.contrats[0].user);
        }
        
        if (res.data.success) {
          setContrats(res.data.contrats || []);
        } else {
          throw new Error(res.data.message || "Erreur de chargement");
        }
        
      } catch (err) {
        console.error("❌ Erreur chargement contrats:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContrats();
  }, []);

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'Actif': return '#2ecc71';
      case 'Terminé': return '#e74c3c';
      case 'Suspendu': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  const getTypeContratColor = (type) => {
    switch(type) {
      case 'CDI': return '#3498db';
      case 'CDD': return '#9b59b6';
      case 'Alternance': return '#1abc9c';
      default: return '#7f8c8d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Erreur formatage date:", error);
      return "Date invalide";
    }
  };

  const formatSalaire = (salaire) => {
    if (!salaire || isNaN(salaire)) return "Non défini";
    
    // FORMATAGE EN MGA SEULEMENT
    return new Intl.NumberFormat('mg-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salaire);
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
        <p>Chargement de vos contrats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#e74c3c" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: "#3498db",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px", 
        color: "#2c3e50",
        marginBottom: "30px"
      }}>
        <span style={{ fontSize: "32px" }}>📑</span>
        Mes Contrats
      </h1>

      {contrats.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px", 
          color: "#7f8c8d" 
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>📄</div>
          <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>Aucun contrat</h3>
          <p>Vous n'avez aucun contrat associé à votre compte.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gap: "20px"
        }}>
          {contrats.map((contrat, index) => (
            <div 
              key={contrat._id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "25px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderLeft: `4px solid ${getTypeContratColor(contrat.typeContrat)}`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              {/* En-tête du contrat */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "15px"
              }}>
                <div>
                  <h3 style={{ 
                    margin: "0 0 8px 0", 
                    color: "#2c3e50",
                    fontSize: "20px"
                  }}>
                    Contrat {contrat.typeContrat}
                  </h3>
                  <div style={{ 
                    display: "flex", 
                    gap: "10px", 
                    flexWrap: "wrap",
                    alignItems: "center"
                  }}>
                    <span style={{
                      padding: "6px 12px",
                      background: getTypeContratColor(contrat.typeContrat),
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {contrat.typeContrat}
                    </span>
                    <span style={{
                      padding: "6px 12px",
                      background: getStatutColor(contrat.statut),
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {contrat.statut}
                    </span>
                  </div>
                </div>
                
                <div style={{ textAlign: "right" }}>
                  <div style={{ 
                    fontSize: "24px", 
                    fontWeight: "bold", 
                    color: "#27ae60" 
                  }}>
                    {formatSalaire(contrat.salaire)}
                  </div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#7f8c8d",
                    marginTop: "4px"
                  }}>
                    Salaire annuel
                  </div>
                </div>
              </div>

              {/* Informations du contrat */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginBottom: "20px"
              }}>
                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#7f8c8d",
                    marginBottom: "4px"
                  }}>
                    📅 Date de début
                  </div>
                  <div style={{ 
                    fontWeight: "500", 
                    color: "#2c3e50" 
                  }}>
                    {formatDate(contrat.dateDebut)}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#7f8c8d",
                    marginBottom: "4px"
                  }}>
                    {contrat.typeContrat === 'CDI' ? '🏁' : '📅'} Date de fin
                  </div>
                  <div style={{ 
                    fontWeight: "500", 
                    color: "#2c3e50" 
                  }}>
                    {contrat.typeContrat === 'CDI' ? 'Contrat à durée indéterminée' : formatDate(contrat.dateFin)}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#7f8c8d",
                    marginBottom: "4px"
                  }}>
                    🏢 Service
                  </div>
                  <div style={{ 
                    fontWeight: "500", 
                    color: "#2c3e50" 
                  }}>
                    {contrat.user?.service?.nomService || "Non assigné"}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#7f8c8d",
                    marginBottom: "4px"
                  }}>
                    📝 Poste
                  </div>
                  <div style={{ 
                    fontWeight: "500", 
                    color: "#2c3e50" 
                  }}>
                    {contrat.user?.poste || "Non défini"}
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div style={{
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #e9ecef"
              }}>
                <div style={{ 
                  fontSize: "12px", 
                  color: "#7f8c8d",
                  marginBottom: "8px"
                }}>
                  👤 Informations personnelles
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "10px",
                  fontSize: "14px"
                }}>
                  <div>
                    <strong>Nom:</strong> {contrat.user?.nom} {contrat.user?.prenom}
                  </div>
                  <div>
                    <strong>Email:</strong> {contrat.user?.email}
                  </div>
                  <div>
                    <strong>Rôle:</strong> {contrat.user?.role}
                  </div>
                  {contrat.user?.matricule && (
                    <div>
                      <strong>Matricule:</strong> {contrat.user.matricule}
                    </div>
                  )}
                </div>
              </div>

              {/* Date de création */}
              <div style={{
                marginTop: "15px",
                fontSize: "12px",
                color: "#95a5a6",
                textAlign: "right"
              }}>
                Créé le {formatDate(contrat.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {contrats.length > 0 && (
        <div style={{
          marginTop: "30px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap"
        }}>
          <div style={{
            background: "#3498db",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            flex: "1",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Total contrats</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{contrats.length}</div>
          </div>
          
          <div style={{
            background: "#2ecc71",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            flex: "1",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Contrats actifs</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {contrats.filter(c => c.statut === 'Actif').length}
            </div>
          </div>
          
          <div style={{
            background: "#e74c3c",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            flex: "1",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Contrats terminés</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {contrats.filter(c => c.statut === 'Terminé').length}
            </div>
          </div>

          <div style={{
            background: "#9b59b6",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            flex: "1",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Masse salariale totale</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {formatSalaire(contrats.reduce((total, c) => total + (c.salaire || 0), 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}