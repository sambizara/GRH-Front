import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Conges() {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [congesPerPage, setCongesPerPage] = useState(10);

  const [form, setForm] = useState({
    typeConge: "Annuel",
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0],
    motif: ""
  });

  // Calculs pour la pagination
  const indexOfLastConge = currentPage * congesPerPage;
  const indexOfFirstConge = indexOfLastConge - congesPerPage;
  const filteredConges = conges.filter(conge =>
    conge.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.typeConge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.motif?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentConges = filteredConges.slice(indexOfFirstConge, indexOfLastConge);
  const totalPages = Math.ceil(filteredConges.length / congesPerPage);

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
    fetchConges();
  }, []);

  const fetchConges = async () => {
    setLoading(true);
    try {
      let endpoint = "/conges/admin/tous"; // ⭐ CORRECTION: Route admin
      
      console.log("🌐 Chargement des congés admin...");
      const response = await api.get(endpoint);
      
      console.log("✅ Réponse admin:", response.data);
      
      // ⭐ CORRECTION: Gestion de la réponse
      if (response.data.success) {
        setConges(response.data.conges || []);
      } else {
        throw new Error(response.data.message || "Erreur de chargement");
      }
      
    } catch (error) {
      console.error("❌ Erreur chargement congés:", error);
      alert(`Erreur lors du chargement des congés: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      typeConge: "Annuel",
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0],
      motif: ""
    });
    setShowForm(false);
    setCurrentPage(1);
  };

  // Soumettre une demande de congé (pour les salariés)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.dateDebut || !form.dateFin) {
      alert("Veuillez remplir les dates de début et de fin");
      return;
    }

    if (new Date(form.dateDebut) > new Date(form.dateFin)) {
      alert("La date de début ne peut pas être après la date de fin");
      return;
    }

    try {
      await api.post("/conges", form);
      alert("Demande de congé créée avec succès");
      resetForm();
      fetchConges();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de la création du congé");
    }
  };

  // Changer le statut (Approuvé / Rejeté) - pour les ADMIN_RH
  const updateStatut = async (id, statut) => {
    try {
      // ⭐ CORRECTION: Route admin pour mise à jour
      await api.put(`/conges/admin/${id}/statut`, { statut });
      alert(`Congé ${statut.toLowerCase()} avec succès`);
      fetchConges();
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error);
      alert(`Erreur lors de la mise à jour: ${error.response?.data?.message || error.message}`);
    }
  };

  // Supprimer un congé
  const handleDelete = async (conge) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la demande de congé de ${conge.user?.nom} ${conge.user?.prenom} ?`)) {
      return;
    }

    try {
      await api.delete(`/conges/${conge._id}`);
      alert("Congé supprimé avec succès");
      fetchConges();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      alert(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  // Fonction pour obtenir le style du statut
  const getStatutStyle = (statut) => {
    switch (statut) {
      case "Approuvé":
        return { background: "#2ecc71", color: "white" };
      case "Rejeté":
        return { background: "#e74c3c", color: "white" };
      case "En Attente":
        return { background: "#f39c12", color: "white" };
      default:
        return { background: "#bdc3c7", color: "white" };
    }
  };

  // Fonction pour obtenir le style du type de congé
  const getTypeCongeStyle = (typeConge) => {
    switch (typeConge) {
      case "Annuel":
        return { background: "#3498db", color: "white" };
      case "Maladie":
        return { background: "#e74c3c", color: "white" };
      case "Sans Solde":
        return { background: "#95a5a6", color: "white" };
      case "Maternité":
        return { background: "#9b59b6", color: "white" };
      case "Paternité":
        return { background: "#1abc9c", color: "white" };
      default:
        return { background: "#bdc3c7", color: "white" };
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* En-tête avec bouton d'ajout et recherche */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>📅 Gestion des Congés</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Barre de recherche */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher un congé..."
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

          {/* Bouton Demander un congé (seulement pour les salariés) */}
          {userRole === "SALARIE" && (
            <button
              onClick={() => setShowForm(true)}
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
              ➕ Demander un congé
            </button>
          )}
        </div>
      </div>

      {/* Formulaire de demande de congé (seulement pour les salariés) */}
      {showForm && userRole === "SALARIE" && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            📝 Nouvelle demande de congé
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Type de congé *</label>
              <select
                name="typeConge"
                value={form.typeConge}
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
                <option value="Annuel">Annuel</option>
                <option value="Maladie">Maladie</option>
                <option value="Sans Solde">Sans solde</option>
                <option value="Maternité">Maternité</option>
                <option value="Paternité">Paternité</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Date de début *</label>
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
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Date de fin *</label>
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
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Motif</label>
              <textarea
                name="motif"
                value={form.motif}
                onChange={handleInputChange}
                placeholder="Raison de la demande de congé..."
                rows="3"
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
                Soumettre la demande
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination */}
      {filteredConges.length > 0 && (
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
            Affichage de {indexOfFirstConge + 1} à {Math.min(indexOfLastConge, filteredConges.length)} sur {filteredConges.length} congé(s)
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
            <span style={{ fontSize: "14px", color: "#6c757d" }}>Congés par page:</span>
            <select
              value={congesPerPage}
              onChange={(e) => {
                setCongesPerPage(Number(e.target.value));
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

      {/* Tableau des congés */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des congés...
          </div>
        ) : filteredConges.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm ? "Aucun congé trouvé" : "Aucun congé enregistré"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Employé</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Type</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date début</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date fin</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Motif</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Statut</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentConges.map((conge, index) => (
                  <tr 
                    key={conge._id}
                    style={{ 
                      background: index % 2 === 0 ? "#f8f9fa" : "white",
                      borderBottom: "1px solid #e9ecef"
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "500" }}>
                        {conge.user ? `${conge.user.nom} ${conge.user.prenom}` : "-"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                        <div>
                          {conge.user?.role}
                          {conge.user?.service?.nomService ? ` • ${conge.user.service.nomService}` : " • Aucun service"}
                        </div>
                        {conge.user?.poste && (
                          <div style={{ marginTop: "2px" }}>
                            📝 {conge.user.poste}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        ...getTypeCongeStyle(conge.typeConge)
                      }}>
                        {conge.typeConge}
                      </span>
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {new Date(conge.dateDebut).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {new Date(conge.dateFin).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d", maxWidth: "200px" }}>
                      {conge.motif || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        ...getStatutStyle(conge.statut)
                      }}>
                        {conge.statut}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                        {/* Actions pour ADMIN_RH */}
                        {userRole === "ADMIN_RH" && conge.statut === "En Attente" && (
                          <>
                            <button
                              onClick={() => updateStatut(conge._id, "Approuvé")}
                              style={{
                                background: "#2ecc71",
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
                              ✅ Approuver
                            </button>
                            <button
                              onClick={() => updateStatut(conge._id, "Rejeté")}
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
                              ❌ Rejeter
                            </button>
                          </>
                        )}
                        
                        {/* Bouton supprimer */}
                        {(userRole === "ADMIN_RH" || (userRole === "SALARIE" && conge.statut === "En Attente")) && (
                          <button
                            onClick={() => handleDelete(conge)}
                            style={{
                              background: "#95a5a6",
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
                      </div>
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total demandes</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{conges.length}</div>
        </div>
        
        <div style={{
          background: "#f39c12",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>En attente</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {conges.filter(c => c.statut === "En Attente").length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Approuvés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {conges.filter(c => c.statut === "Approuvé").length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Rejetés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {conges.filter(c => c.statut === "Rejeté").length}
          </div>
        </div>
      </div>
    </div>
  );
}