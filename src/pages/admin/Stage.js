import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function StagesAdmin() {
  const [stages, setStages] = useState([]);
  const [encadreurs, setEncadreurs] = useState([]);
  const [stagesSansEncadreur, setStagesSansEncadreur] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tous"); // "tous" ou "sans-encadreur"
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationForm, setNotificationForm] = useState({ show: false, userId: "", message: "" });
  const [assignForm, setAssignForm] = useState({ show: false, stageId: "", encadreurId: "" });

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [stagesPerPage, setStagesPerPage] = useState(10);

  useEffect(() => {
    fetchStages();
    fetchUsers();
    fetchStagesSansEncadreur();
  }, []);

  const fetchStages = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stages");
      setStages(response.data);
    } catch (error) {
      console.error("Erreur chargement stages:", error);
      alert("Erreur lors du chargement des stages");
    } finally {
      setLoading(false);
    }
  };

  const fetchStagesSansEncadreur = async () => {
    try {
      const response = await api.get("/stages/sans-encadreur");
      setStagesSansEncadreur(response.data);
    } catch (error) {
      console.error("Erreur chargement stages sans encadreur:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      const encadreursList = response.data.filter(user => 
        user.role === "SALARIE" || user.role === "ADMIN_RH"
      );
      setEncadreurs(encadreursList);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  // Assigner un encadreur à un stage
  const handleAssignEncadreur = async (e) => {
    e.preventDefault();
    
    if (!assignForm.stageId || !assignForm.encadreurId) {
      alert("Veuillez sélectionner un stage et un encadreur");
      return;
    }

    try {
      await api.post("/stages/assign", {
        stageId: assignForm.stageId,
        encadreurId: assignForm.encadreurId
      });
      
      alert("Encadreur assigné avec succès");
      setAssignForm({ show: false, stageId: "", encadreurId: "" });
      fetchStages();
      fetchStagesSansEncadreur();
    } catch (error) {
      console.error("Erreur assignation:", error);
      alert(error.response?.data?.message || "Erreur lors de l'assignation");
    }
  };

  // Mettre à jour le statut d'un stage
  const updateStageStatus = async (id, statut) => {
    try {
      await api.put(`/stages/${id}/statut`, { statut });
      alert(`Statut du stage mis à jour: ${statut}`);
      fetchStages();
      fetchStagesSansEncadreur();
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // Supprimer un stage
  const handleDelete = async (stage) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le stage "${stage.sujet}" ?`)) {
      return;
    }

    try {
      await api.delete(`/stages/${stage._id}`);
      alert("Stage supprimé avec succès");
      fetchStages();
      fetchStagesSansEncadreur();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Envoyer une notification
  const sendNotification = async (e) => {
    e.preventDefault();
    
    if (!notificationForm.userId || !notificationForm.message) {
      alert("Veuillez remplir tous les champs de la notification");
      return;
    }

    try {
      await api.post("/stages/notify", {
        userId: notificationForm.userId,
        type: "Stage",
        message: notificationForm.message
      });
      alert("Notification envoyée avec succès");
      setNotificationForm({ show: false, userId: "", message: "" });
    } catch (error) {
      console.error("Erreur notification:", error);
      alert("Erreur lors de l'envoi de la notification");
    }
  };

  // Fonction pour obtenir le style du statut
  const getStatutStyle = (statut) => {
    switch (statut) {
      case "En cours":
        return { background: "#3498db", color: "white" };
      case "Terminé":
        return { background: "#2ecc71", color: "white" };
      case "Annulé":
        return { background: "#e74c3c", color: "white" };
      default:
        return { background: "#bdc3c7", color: "white" };
    }
  };

  // Calculer la durée restante
  const calculerDureeRestante = (dateFin) => {
    const maintenant = new Date();
    const fin = new Date(dateFin);
    const diffTime = fin - maintenant;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Terminé";
    if (diffDays === 0) return "Dernier jour";
    return `${diffDays} jour(s)`;
  };

  // Obtenir le style de la durée
  const getDureeStyle = (dateFin) => {
    const maintenant = new Date();
    const fin = new Date(dateFin);
    const diffTime = fin - maintenant;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { background: "#95a5a6", color: "white" };
    if (diffDays <= 7) return { background: "#e74c3c", color: "white" };
    if (diffDays <= 30) return { background: "#f39c12", color: "white" };
    return { background: "#2ecc71", color: "white" };
  };

  // Filtrage et pagination
  const filteredStages = (activeTab === "sans-encadreur" ? stagesSansEncadreur : stages).filter(stage =>
    stage.stagiaire?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.stagiaire?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.encadreur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.encadreur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.sujet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.statut?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStage = currentPage * stagesPerPage;
  const indexOfFirstStage = indexOfLastStage - stagesPerPage;
  const currentStages = filteredStages.slice(indexOfFirstStage, indexOfLastStage);
  const totalPages = Math.ceil(filteredStages.length / stagesPerPage);

  // Navigation pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* En-tête avec onglets */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>🎓 Gestion des Stages (Admin)</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Barre de recherche */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher un stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px 40px 10px 15px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                width: "250px",
                fontSize: "14px"
              }}
            />
            <span style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7f8c8d"
            }}>
              🔍
            </span>
          </div>

          {/* Bouton Assigner encadreur */}
          <button
            onClick={() => setAssignForm({ show: true, stageId: "", encadreurId: "" })}
            disabled={stagesSansEncadreur.length === 0}
            style={{
              background: stagesSansEncadreur.length === 0 ? "#bdc3c7" : "#9b59b6",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: stagesSansEncadreur.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            👥 Assigner encadreur
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => { setActiveTab("tous"); setCurrentPage(1); }}
          style={{
            background: activeTab === "tous" ? "#3498db" : "white",
            color: activeTab === "tous" ? "white" : "#3498db",
            border: "1px solid #3498db",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Tous les stages ({stages.length})
        </button>
        <button
          onClick={() => { setActiveTab("sans-encadreur"); setCurrentPage(1); }}
          style={{
            background: activeTab === "sans-encadreur" ? "#e74c3c" : "white",
            color: activeTab === "sans-encadreur" ? "white" : "#e74c3c",
            border: "1px solid #e74c3c",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Stages sans encadreur ({stagesSansEncadreur.length})
        </button>
      </div>

      {/* Formulaire d'assignation d'encadreur */}
      {assignForm.show && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            👥 Assigner un encadreur
          </h3>
          
          <form onSubmit={handleAssignEncadreur} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Stage *</label>
              <select
                value={assignForm.stageId}
                onChange={(e) => setAssignForm(prev => ({ ...prev, stageId: e.target.value }))}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  background: "white"
                }}
              >
                <option value="">Sélectionner un stage</option>
                {stagesSansEncadreur.map(stage => (
                  <option key={stage._id} value={stage._id}>
                    {stage.stagiaire.nom} {stage.stagiaire.prenom} - {stage.sujet}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Encadreur *</label>
              <select
                value={assignForm.encadreurId}
                onChange={(e) => setAssignForm(prev => ({ ...prev, encadreurId: e.target.value }))}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  background: "white"
                }}
              >
                <option value="">Sélectionner un encadreur</option>
                {encadreurs.map(encadreur => (
                  <option key={encadreur._id} value={encadreur._id}>
                    {encadreur.nom} {encadreur.prenom} - {encadreur.role}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setAssignForm({ show: false, stageId: "", encadreurId: "" })}
                style={{
                  background: "#95a5a6",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{
                  background: "#9b59b6",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Assigner
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination */}
      {filteredStages.length > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 20px",
          background: "#f8f9fa",
          border: "1px solid #e9ecef",
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          <div style={{ color: "#6c757d", fontSize: "14px" }}>
            Affichage de {indexOfFirstStage + 1} à {Math.min(indexOfLastStage, filteredStages.length)} sur {filteredStages.length} stage(s)
          </div>
          
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                border: "1px solid #dee2e6",
                background: currentPage === 1 ? "#f8f9fa" : "white",
                color: currentPage === 1 ? "#6c757d" : "#007bff",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "14px"
              }}
            >
              ◀ Précédent
            </button>

            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #dee2e6",
                    background: currentPage === page ? "#007bff" : "white",
                    color: currentPage === page ? "white" : "#007bff",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    minWidth: "40px"
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                border: "1px solid #dee2e6",
                background: currentPage === totalPages ? "#f8f9fa" : "white",
                color: currentPage === totalPages ? "#6c757d" : "#007bff",
                borderRadius: "4px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: "14px"
              }}
            >
              Suivant ▶
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#6c757d" }}>Stages par page:</span>
            <select
              value={stagesPerPage}
              onChange={(e) => {
                setStagesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 10px",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* Tableau des stages */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des stages...
          </div>
        ) : filteredStages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm ? "Aucun stage trouvé" : "Aucun stage enregistré"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Stagiaire</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Encadreur</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Sujet</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Période</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Durée restante</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Statut</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStages.map((stage, index) => (
                  <tr 
                    key={stage._id}
                    style={{ 
                      background: index % 2 === 0 ? "#f8f9fa" : "white",
                      borderBottom: "1px solid #e9ecef"
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "500" }}>
                        {stage.stagiaire ? `${stage.stagiaire.nom} ${stage.stagiaire.prenom}` : "-"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                        {stage.stagiaire?.email}
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      {stage.encadreur ? (
                        <>
                          <div style={{ fontWeight: "500" }}>
                            {stage.encadreur.nom} {stage.encadreur.prenom}
                          </div>
                          <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                            {stage.encadreur.email}
                          </div>
                        </>
                      ) : (
                        <span style={{ color: "#e74c3c", fontStyle: "italic" }}>
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "15px", maxWidth: "200px" }}>
                      <div style={{ fontWeight: "500" }}>
                        {stage.sujet}
                      </div>
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      <div>
                        {new Date(stage.dateDebut).toLocaleDateString('fr-FR')}
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        au {new Date(stage.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        ...getDureeStyle(stage.dateFin)
                      }}>
                        {calculerDureeRestante(stage.dateFin)}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        ...getStatutStyle(stage.statut)
                      }}>
                        {stage.statut}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                        {/* Changer statut */}
                        {stage.statut !== "Terminé" && (
                          <button
                            onClick={() => updateStageStatus(stage._id, "Terminé")}
                            style={{
                              background: "#2ecc71",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            ✅ Terminer
                          </button>
                        )}
                        {stage.statut !== "Annulé" && (
                          <button
                            onClick={() => updateStageStatus(stage._id, "Annulé")}
                            style={{
                              background: "#e74c3c",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            ❌ Annuler
                          </button>
                        )}
                        
                        {/* Notifier */}
                        <button
                          onClick={() => setNotificationForm({ 
                            show: true, 
                            userId: stage.stagiaire?._id, 
                            message: `Stage: ${stage.sujet}` 
                          })}
                          style={{
                            background: "#f39c12",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          📧 Notifier
                        </button>
                        
                        {/* Supprimer */}
                        <button
                          onClick={() => handleDelete(stage)}
                          style={{
                            background: "#95a5a6",
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulaire de notification */}
      {notificationForm.show && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          zIndex: 1000,
          minWidth: "400px"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            📧 Envoyer une notification
          </h3>
          
          <form onSubmit={sendNotification} style={{ display: "grid", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Message *</label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Votre message de notification..."
                rows="4"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setNotificationForm({ show: false, userId: "", message: "" })}
                style={{
                  background: "#95a5a6",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Overlay pour le formulaire de notification */}
      {notificationForm.show && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 999
        }} />
      )}

      {/* Statistiques */}
      <div style={{
        marginTop: "20px",
        display: "flex",
        gap: "15px",
        flexWrap: "wrap"
      }}>
        <div style={{
          background: "#3498db",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total stages</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stages.length}</div>
        </div>
        
        <div style={{
          background: "#3498db",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>En cours</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stages.filter(s => s.statut === "En cours").length}
          </div>
        </div>
        
        <div style={{
          background: "#2ecc71",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Terminés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stages.filter(s => s.statut === "Terminé").length}
          </div>
        </div>
        
        <div style={{
          background: "#e74c3c",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Sans encadreur</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stagesSansEncadreur.length}
          </div>
        </div>
      </div>
    </div>
  );
}