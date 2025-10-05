import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Presence() {
  const [presences, setPresences] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [presencesPerPage, setPresencesPerPage] = useState(10);

  const [form, setForm] = useState({ 
    userId: "", 
    date: new Date().toISOString().split('T')[0],
    heureArrivee: "",
    heureDepart: "", 
    statut: "Présent" 
  });

  // Calculs pour la pagination
  const indexOfLastPresence = currentPage * presencesPerPage;
  const indexOfFirstPresence = indexOfLastPresence - presencesPerPage;
  const filteredPresences = presences.filter(presence =>
    presence.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presence.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presence.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (presence.user?.service?.nomService && presence.user.service.nomService.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const currentPresences = filteredPresences.slice(indexOfFirstPresence, indexOfLastPresence);
  const totalPages = Math.ceil(filteredPresences.length / presencesPerPage);

  // Fonctions de navigation
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    fetchPresences();
    fetchUsers();
  }, []);

  const fetchPresences = async () => {
    setLoading(true);
    try {
      const response = await api.get("/presences");
      setPresences(response.data);
    } catch (error) {
      console.error("Erreur chargement présences:", error);
      alert("Erreur lors du chargement des présences");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      // Filtrer seulement les salariés et stagiaires pour les présences
      const filteredUsers = response.data.filter(user => 
        user.role === "SALARIE" || user.role === "STAGIAIRE"
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ 
      userId: "", 
      date: new Date().toISOString().split('T')[0],
      heureArrivee: "",
      heureDepart: "", 
      statut: "Présent" 
    });
    setShowForm(false);
    setCurrentPage(1);
  };

  // Pointer arrivée (pour les employés)
  const pointerArrivee = async () => {
    try {
      await api.post("/presences/arrivee");
      alert("Arrivée pointée avec succès");
      fetchPresences();
    } catch (error) {
      console.error("Erreur pointage arrivée:", error);
      alert(error.response?.data?.message || "Erreur lors du pointage d'arrivée");
    }
  };

  // Pointer départ (pour les employés)
  const pointerDepart = async () => {
    try {
      await api.post("/presences/depart");
      alert("Départ pointé avec succès");
      fetchPresences();
    } catch (error) {
      console.error("Erreur pointage départ:", error);
      alert(error.response?.data?.message || "Erreur lors du pointage de départ");
    }
  };

  // Ajouter une présence/absence manuellement (ADMIN_RH)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.userId || !form.date) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (form.statut === "Absent") {
        // Utiliser la route absence
        await api.post("/presences/absence", {
          userId: form.userId,
          date: form.date
        });
        alert("Absence marquée avec succès");
      } else {
        // Utiliser la route présence manuelle
        const presenceData = {
          userId: form.userId,
          date: form.date,
          statut: form.statut
        };

        // Ajouter les heures seulement si elles sont spécifiées
        if (form.heureArrivee) {
          presenceData.heureArrivee = `${form.date}T${form.heureArrivee}`;
        }
        if (form.heureDepart) {
          presenceData.heureDepart = `${form.date}T${form.heureDepart}`;
        }

        await api.post("/presences/presence", presenceData);
        alert("Présence ajoutée avec succès");
      }

      resetForm();
      fetchPresences();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  // Supprimer une présence
  const handleDelete = async (presence) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la présence de ${presence.user?.nom} ${presence.user?.prenom} du ${new Date(presence.date).toLocaleDateString('fr-FR')} ?`)) {
      return;
    }

    try {
      // Note: Vous devrez créer cette route dans votre backend
      // await api.delete(`/presences/${presence._id}`);
      alert("⚠️ Fonctionnalité de suppression à implémenter dans le backend");
      // Pour l'instant, on recharge juste les données
      fetchPresences();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Fonction pour obtenir le style du statut
  const getStatutStyle = (statut) => {
    switch (statut) {
      case "Présent":
        return { background: "#2ecc71", color: "white" };
      case "Absent":
        return { background: "#e74c3c", color: "white" };
      case "En Retard":
        return { background: "#f39c12", color: "white" };
      default:
        return { background: "#bdc3c7", color: "white" };
    }
  };

  // Calculer la durée de travail
  const calculerDuree = (heureArrivee, heureDepart) => {
    if (!heureArrivee || !heureDepart) return "-";
    
    const arrivee = new Date(heureArrivee);
    const depart = new Date(heureDepart);
    const dureeMs = depart - arrivee;
    
    const heures = Math.floor(dureeMs / (1000 * 60 * 60));
    const minutes = Math.floor((dureeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${heures}h${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* En-tête avec boutons et recherche */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>⏰ Gestion des Présences</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Barre de recherche */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher une présence..."
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

          {/* Boutons de pointage pour les employés */}
          {(userRole === "SALARIE" || userRole === "STAGIAIRE") && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={pointerArrivee}
                style={{
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                🟢 Pointer Arrivée
              </button>
              <button
                onClick={pointerDepart}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                🔴 Pointer Départ
              </button>
            </div>
          )}

          {/* Bouton Ajouter présence/absence pour ADMIN_RH */}
          {userRole === "ADMIN_RH" && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#3498db",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              ➕ Ajouter présence
            </button>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout manuel (ADMIN_RH) */}
      {showForm && userRole === "ADMIN_RH" && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            📝 Ajouter une présence/absence manuellement
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Employé *</label>
              <select
                name="userId"
                value={form.userId}
                onChange={handleInputChange}
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
                <option value="">Sélectionner un employé</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.nom} {user.prenom} - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Date *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Heure d'arrivée</label>
              <input
                type="time"
                name="heureArrivee"
                value={form.heureArrivee}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Heure de départ</label>
              <input
                type="time"
                name="heureDepart"
                value={form.heureDepart}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Statut *</label>
              <select
                name="statut"
                value={form.statut}
                onChange={handleInputChange}
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
                <option value="Présent">Présent</option>
                <option value="Absent">Absent</option>
                <option value="En Retard">En Retard</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={resetForm}
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
                Ajouter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination */}
      {filteredPresences.length > 0 && (
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
            Affichage de {indexOfFirstPresence + 1} à {Math.min(indexOfLastPresence, filteredPresences.length)} sur {filteredPresences.length} présence(s)
          </div>
          
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Bouton Précédent */}
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
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              ◀ Précédent
            </button>

            {/* Numéros de page */}
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

            {/* Bouton Suivant */}
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
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Suivant ▶
            </button>
          </div>

          {/* Sélecteur d'éléments par page */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#6c757d" }}>Présences par page:</span>
            <select
              value={presencesPerPage}
              onChange={(e) => {
                setPresencesPerPage(Number(e.target.value));
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

      {/* Tableau des présences */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des présences...
          </div>
        ) : filteredPresences.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm ? "Aucune présence trouvée" : "Aucune présence enregistrée"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Employé</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Arrivée</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Départ</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Durée</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Statut</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPresences.map((presence, index) => (
                  <tr 
                    key={presence._id}
                    style={{ 
                      background: index % 2 === 0 ? "#f8f9fa" : "white",
                      borderBottom: "1px solid #e9ecef"
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "500" }}>
                        {presence.user ? `${presence.user.nom} ${presence.user.prenom}` : "-"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                        {presence.user?.role}
                        {presence.user?.service?.nomService && ` • ${presence.user.service.nomService}`}
                        {presence.user?.poste && (
                          <div style={{ marginTop: "2px" }}>
                            📝 {presence.user.poste}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {new Date(presence.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {presence.heureArrivee ? new Date(presence.heureArrivee).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', minute: '2-digit' 
                      }) : "-"}
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {presence.heureDepart ? new Date(presence.heureDepart).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', minute: '2-digit' 
                      }) : "-"}
                    </td>
                    <td style={{ padding: "15px", fontWeight: "bold", color: "#2c3e50" }}>
                      {calculerDuree(presence.heureArrivee, presence.heureDepart)}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        ...getStatutStyle(presence.statut)
                      }}>
                        {presence.statut}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      {userRole === "ADMIN_RH" && (
                        <button
                          onClick={() => handleDelete(presence)}
                          style={{
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total présences</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{presences.length}</div>
        </div>
        
        <div style={{
          background: "#2ecc71",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Présents</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {presences.filter(p => p.statut === "Présent").length}
          </div>
        </div>
        
        <div style={{
          background: "#f39c12",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>En retard</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {presences.filter(p => p.statut === "En Retard").length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Absents</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {presences.filter(p => p.statut === "Absent").length}
          </div>
        </div>
      </div>
    </div>
  );
}