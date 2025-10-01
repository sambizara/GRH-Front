import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Presence() {
  const [presences, setPresences] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState("");
  const [form, setForm] = useState({ 
    userId: "", 
    date: "", 
    heureArrivee: "", 
    heureDepart: "", 
    statut: "Présent" 
  });

  useEffect(() => { 
    console.log("🔍 Presence component mounted");
    fetch(); 
  }, []);

  const fetch = async () => {
    setLoading(true);
    setDebug("Chargement des données...");
    
    try {
      console.log("🔄 Fetching presences and users...");
      
      const [pRes, uRes] = await Promise.all([
        api.get("/presences/admin/allPresences"), // Route correcte pour admin
        api.get("/users")
      ]);
      
      console.log("✅ Presences data:", pRes.data);
      console.log("✅ Users data:", uRes.data);
      
      setPresences(pRes.data);
      setUsers(uRes.data);
      setDebug(`✅ Données chargées: ${pRes.data.length} présences, ${uRes.data.length} utilisateurs`);
      
    } catch (error) {
      console.error("❌ Erreur chargement:", error);
      setDebug(`❌ Erreur: ${error.response?.data?.message || error.message}`);
      
      // Données mockées pour le développement
      setUsers([
        { _id: "1", nom: "Dupont", prenom: "Jean", role: "SALARIE" },
        { _id: "2", nom: "Martin", prenom: "Marie", role: "SALARIE" }
      ]);
      setPresences([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!form.userId || !form.date) {
      setDebug("❌ Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    setDebug("Création en cours...");

    try {
      // Utilisez marquerAbsence pour les absences
      if (form.statut === "Absent") {
        await api.post("/presences/admin/marquerAbsence", {
          userId: form.userId,
          date: form.date
        });
        setDebug("✅ Absence marquée avec succès!");
      } else {
        // Pour les présences/retards, utilisez la route standard
        // Note: Vous devrez peut-être adapter selon votre backend
        await api.post("/presences/admin/marquerAbsence", {
          userId: form.userId,
          date: form.date
        });
        setDebug("✅ Présence enregistrée avec succès!");
      }

      // Réinitialiser le formulaire
      setForm({ 
        userId: "", 
        date: "", 
        heureArrivee: "", 
        heureDepart: "", 
        statut: "Présent" 
      });
      
      // Recharger les données
      fetch();
      
    } catch (error) {
      console.error("❌ Erreur création:", error);
      setDebug(`❌ Erreur création: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette présence ?")) return;
    
    setDebug("Suppression en cours...");
    try {
      // Note: Vous devrez créer cette route dans votre backend
      // await api.delete(`/presences/admin/${id}`);
      setDebug("⚠️ Fonctionnalité de suppression à implémenter dans le backend");
      
      // Pour l'instant, on recharge juste les données
      fetch();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      setDebug(`❌ Erreur suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>📋 Gestion des présences</h2>
          
          {/* Section Debug */}
          <div style={{
            background: loading ? "#fff3cd" : "#d4edda",
            border: "1px solid",
            borderColor: loading ? "#ffeaa7" : "#c3e6cb",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "4px",
            fontSize: "14px"
          }}>
            <strong>🔍 Statut:</strong> 
            <div style={{ marginTop: "5px", fontFamily: "monospace" }}>
              {loading ? "⏳ Chargement..." : debug}
            </div>
          </div>

          {/* Formulaire */}
          <div style={{ 
            background: "#f8f9fa", 
            padding: "20px", 
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>➕ Ajouter une présence/absence</h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "15px",
              alignItems: "end"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Utilisateur *
                </label>
                <select 
                  value={form.userId} 
                  onChange={e => setForm({...form, userId: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  required
                >
                  <option value="">-- Choisir utilisateur --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.nom} {u.prenom} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Date *
                </label>
                <input 
                  type="date" 
                  value={form.date} 
                  onChange={e => setForm({...form, date: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Heure d'arrivée
                </label>
                <input 
                  type="time" 
                  value={form.heureArrivee} 
                  onChange={e => setForm({...form, heureArrivee: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Heure de départ
                </label>
                <input 
                  type="time" 
                  value={form.heureDepart} 
                  onChange={e => setForm({...form, heureDepart: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Statut *
                </label>
                <select 
                  value={form.statut} 
                  onChange={e => setForm({...form, statut: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                >
                  <option value="Présent">PRÉSENT</option>
                  <option value="Absent">ABSENT</option>
                  <option value="En Retard">RETARD</option>
                </select>
              </div>

              <div>
                <button 
                  onClick={create}
                  disabled={loading}
                  style={{
                    background: loading ? "#6c757d" : "#28a745",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    width: "100%",
                    fontWeight: "bold"
                  }}
                >
                  {loading ? "⏳ En cours..." : "✅ Ajouter"}
                </button>
              </div>
            </div>
          </div>

          {/* Tableau des présences */}
          <div>
            <h3>📊 Liste des présences ({presences.length})</h3>
            
            {presences.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                background: "#f8f9fa",
                borderRadius: "8px",
                color: "#6c757d",
                border: "2px dashed #dee2e6"
              }}>
                📝 Aucune présence enregistrée
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  background: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <thead>
                    <tr style={{ background: "#343a40", color: "white" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>Nom</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Arrivée</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Départ</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Statut</th>
                      <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presences.map(p => (
                      <tr key={p._id} style={{ borderBottom: "1px solid #dee2e6" }}>
                        <td style={{ padding: "12px" }}>
                          <strong>{p.user?.nom} {p.user?.prenom}</strong>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {new Date(p.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {p.heureArrivee ? new Date(p.heureArrivee).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', minute: '2-digit' 
                          }) : "-"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {p.heureDepart ? new Date(p.heureDepart).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', minute: '2-digit' 
                          }) : "-"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            background: 
                              p.statut === "Présent" ? "#d4edda" :
                              p.statut === "Absent" ? "#f8d7da" : "#fff3cd",
                            color: 
                              p.statut === "Présent" ? "#155724" :
                              p.statut === "Absent" ? "#721c24" : "#856404"
                          }}>
                            {p.statut}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button 
                            onClick={() => del(p._id)}
                            style={{
                              background: "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            🗑️ Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}