import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axiosConfig";

export default function MesConges() {
  const [conges, setConges] = useState([]);
  const [soldes, setSoldes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ⭐ CORRECTION: Variable utilisée maintenant
  const [activeTab, setActiveTab] = useState('demande');
  const [form, setForm] = useState({
    typeConge: "",
    dateDebut: "",
    dateFin: "",
    motif: ""
  });

  const fetchConges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🌐 Chargement des congés salarié...");
      const res = await api.get("/conges/mes-conges");
      
      console.log("✅ Réponse salarié:", res.data);
      
      if (res.data.success) {
        setConges(res.data.conges || []);
        setSoldes(res.data.soldes);
      } else {
        throw new Error(res.data.message || "Erreur de chargement");
      }
      
    } catch (err) { // ⭐ CORRECTION: Renommé en 'err' pour éviter conflit
      console.error("❌ Erreur chargement congés:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ⭐ CORRECTION: Fonction fetchSoldes définie
  const fetchSoldes = useCallback(async () => {
    try {
      console.log("🔄 Chargement des soldes...");
      const res = await api.get("/conges/mes-soldes");
      setSoldes(res.data);
      console.log("✅ Soldes chargés:", res.data);
    } catch (err) {
      console.error("❌ Erreur chargement soldes:", err);
    }
  }, []);

  useEffect(() => { 
    fetchConges();
    fetchSoldes(); // ⭐ CORRECTION: Fonction maintenant définie
  }, [fetchConges, fetchSoldes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const calculerJoursDemandes = () => {
    if (form.dateDebut && form.dateFin) {
      const debut = new Date(form.dateDebut);
      const fin = new Date(form.dateFin);
      const diffTime = Math.abs(fin - debut);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const demanderConge = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.typeConge || !form.dateDebut || !form.dateFin) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (new Date(form.dateDebut) >= new Date(form.dateFin)) {
      alert("La date de fin doit être après la date de début");
      return;
    }

    const joursDemandes = calculerJoursDemandes();
    console.log("📅 Jours demandés:", joursDemandes);

    try {
      await api.post("/conges", form);
      alert("✅ Demande de congé envoyée avec succès");
      
      // Réinitialiser le formulaire
      setForm({
        typeConge: "",
        dateDebut: "",
        dateFin: "",
        motif: ""
      });
      
      // Recharger la liste et les soldes
      fetchConges();
      fetchSoldes(); // ⭐ CORRECTION: Recharger les soldes après demande
    } catch (err) {
      console.error("❌ Erreur demande congé:", err);
      alert(err.response?.data?.message || "Erreur lors de la demande de congé");
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'Approuvé': return '#2ecc71';
      case 'Rejeté': return '#e74c3c';
      case 'En Attente': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  const getTypeCongeColor = (type) => {
    switch(type) {
      case 'Annuel': return '#3498db';
      case 'Maladie': return '#9b59b6';
      case 'Sans Solde': return '#e67e22';
      case 'Maternité': return '#e84393';
      case 'Paternité': return '#0984e3';
      default: return '#7f8c8d';
    }
  };

  const getSoldeColor = (restant, initial) => {
    const pourcentage = (restant / initial) * 100;
    if (pourcentage > 50) return '#2ecc71';
    if (pourcentage > 25) return '#f39c12';
    return '#e74c3c';
  };

  // ⭐ CORRECTION: Affichage de l'erreur si elle existe
  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#e74c3c" }}>
        <h2>❌ Erreur</h2>
        <p>{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchConges();
          }}
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
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#2c3e50", marginBottom: "30px" }}>📅 Gestion des Congés</h1>

      {/* Navigation par onglets */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "30px",
        borderBottom: "1px solid #e9ecef"
      }}>
        <button
          onClick={() => setActiveTab('demande')}
          style={{
            background: activeTab === 'demande' ? '#3498db' : 'transparent',
            color: activeTab === 'demande' ? 'white' : '#7f8c8d',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'demande' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          📨 Demander un congé
        </button>
        <button
          onClick={() => setActiveTab('soldes')}
          style={{
            background: activeTab === 'soldes' ? '#3498db' : 'transparent',
            color: activeTab === 'soldes' ? 'white' : '#7f8c8d',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'soldes' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          💰 Mes soldes
        </button>
      </div>

      {/* Onglet Demande de congé */}
      {activeTab === 'demande' && (
        <>
          {/* Carte des soldes rapides */}
          {soldes && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#e3f2fd",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #bbdefb"
              }}>
                <div style={{ fontSize: "12px", color: "#1976d2", marginBottom: "5px" }}>Congés Annuels</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1976d2" }}>
                  {soldes.annuel || 0} jours
                </div>
              </div>
              <div style={{
                background: "#f3e5f5",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #e1bee7"
              }}>
                <div style={{ fontSize: "12px", color: "#7b1fa2", marginBottom: "5px" }}>Congés Maladie</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#7b1fa2" }}>
                  {soldes.maladie || 0} jours
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de demande */}
          <div style={{
            background: "#f8f9fa",
            padding: "25px",
            borderRadius: "10px",
            marginBottom: "30px",
            border: "1px solid #e9ecef"
          }}>
            <h3 style={{ marginTop: 0, color: "#2c3e50" }}>➕ Nouvelle demande de congé</h3>
            
            <form onSubmit={demanderConge}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginBottom: "20px"
              }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Type de congé *
                  </label>
                  <select 
                    name="typeConge"
                    value={form.typeConge}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px"
                    }}
                  >
                    <option value="">Choisir un type</option>
                    <option value="Annuel">Annuel ({soldes?.annuel || 0} jours restants)</option>
                    <option value="Maladie">Maladie ({soldes?.maladie || 0} jours restants)</option>
                    <option value="Sans Solde">Sans solde</option>
                    <option value="Maternité">Maternité ({soldes?.maternite || 0} jours restants)</option>
                    <option value="Paternité">Paternité ({soldes?.paternite || 0} jours restants)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Date de début *
                  </label>
                  <input
                    type="date"
                    name="dateDebut"
                    value={form.dateDebut}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    name="dateFin"
                    value={form.dateFin}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px"
                    }}
                  />
                </div>
              </div>

              {form.dateDebut && form.dateFin && (
                <div style={{
                  background: "#e3f2fd",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: "15px",
                  fontSize: "14px",
                  color: "#1976d2"
                }}>
                  ⏱️ Durée demandée: <strong>{calculerJoursDemandes()} jour(s)</strong>
                </div>
              )}

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  Motif (optionnel)
                </label>
                <textarea
                  name="motif"
                  value={form.motif}
                  onChange={handleInputChange}
                  placeholder="Raison de votre demande de congé..."
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    resize: "vertical"
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                📨 Envoyer la demande
              </button>
            </form>
          </div>

          {/* Liste des congés */}
          <div>
            <h3 style={{ color: "#2c3e50", marginBottom: "20px" }}>📋 Mes demandes de congé</h3>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
                Chargement de vos congés...
              </div>
            ) : conges.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
                <div style={{ fontSize: "48px", marginBottom: "15px" }}>📭</div>
                <p>Aucune demande de congé pour le moment</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  background: "white",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}>
                  <thead>
                    <tr style={{ 
                      background: "linear-gradient(135deg, #34495e, #2c3e50)",
                      color: "white"
                    }}>
                      <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Type</th>
                      <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Période</th>
                      <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Durée</th>
                      <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Statut</th>
                      <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Motif</th>
                      <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date demande</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conges.map((conge, index) => {
                      const duree = Math.ceil((new Date(conge.dateFin) - new Date(conge.dateDebut)) / (1000 * 60 * 60 * 24)) + 1;
                      
                      return (
                        <tr 
                          key={conge._id}
                          style={{ 
                            borderBottom: "1px solid #e9ecef",
                            background: index % 2 === 0 ? "#f8f9fa" : "white"
                          }}
                        >
                          <td style={{ padding: "15px" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "5px 10px",
                              background: getTypeCongeColor(conge.typeConge),
                              color: "white",
                              borderRadius: "15px",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}>
                              {conge.typeConge}
                            </span>
                          </td>
                          <td style={{ padding: "15px", color: "#2c3e50" }}>
                            <div><strong>Début:</strong> {new Date(conge.dateDebut).toLocaleDateString()}</div>
                            <div><strong>Fin:</strong> {new Date(conge.dateFin).toLocaleDateString()}</div>
                          </td>
                          <td style={{ padding: "15px", color: "#7f8c8d" }}>
                            {duree} jour{duree > 1 ? 's' : ''}
                          </td>
                          <td style={{ padding: "15px", textAlign: "center" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "6px 12px",
                              background: getStatutColor(conge.statut),
                              color: "white",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              minWidth: "100px"
                            }}>
                              {conge.statut}
                            </span>
                          </td>
                          <td style={{ padding: "15px", color: "#7f8c8d", maxWidth: "200px" }}>
                            {conge.motif || (
                              <span style={{ fontStyle: "italic", color: "#bdc3c7" }}>
                                Aucun motif
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "15px", color: "#7f8c8d", fontSize: "13px" }}>
                            {new Date(conge.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Onglet Soldes */}
      {activeTab === 'soldes' && soldes && (
        <div>
          <h3 style={{ color: "#2c3e50", marginBottom: "30px" }}>💰 Mes soldes de congé</h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {/* Carte Congés Annuels */}
            <div style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderLeft: `4px solid #3498db`
            }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "#3498db",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "20px",
                  marginRight: "15px"
                }}>
                  📅
                </div>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#2c3e50" }}>Congés Annuels</h4>
                  <p style={{ margin: 0, color: "#7f8c8d", fontSize: "14px" }}>Solde annuel</p>
                </div>
              </div>
              <div style={{ 
                background: "#ecf0f1", 
                borderRadius: "8px", 
                padding: "15px",
                marginBottom: "15px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#7f8c8d" }}>Solde restant:</span>
                  <span style={{ 
                    fontWeight: "bold", 
                    color: getSoldeColor(soldes.annuel || 0, 25)
                  }}>
                    {soldes.annuel || 0} jours
                  </span>
                </div>
              </div>
            </div>

            {/* Carte Congés Maladie */}
            <div style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderLeft: `4px solid #9b59b6`
            }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "#9b59b6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "20px",
                  marginRight: "15px"
                }}>
                  🏥
                </div>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#2c3e50" }}>Congés Maladie</h4>
                  <p style={{ margin: 0, color: "#7f8c8d", fontSize: "14px" }}>Arrêts maladie</p>
                </div>
              </div>
              <div style={{ 
                background: "#ecf0f1", 
                borderRadius: "8px", 
                padding: "15px",
                marginBottom: "15px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#7f8c8d" }}>Solde restant:</span>
                  <span style={{ 
                    fontWeight: "bold", 
                    color: getSoldeColor(soldes.maladie || 0, 15)
                  }}>
                    {soldes.maladie || 0} jours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}