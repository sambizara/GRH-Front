import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Rapports() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rapportsPerPage, setRapportsPerPage] = useState(10);

  const [form, setForm] = useState({
    titre: "",
    fichier: ""
  });

  // Calculs pour la pagination
  const indexOfLastRapport = currentPage * rapportsPerPage;
  const indexOfFirstRapport = indexOfLastRapport - rapportsPerPage;
  const filteredRapports = rapports.filter(rapport =>
    rapport.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rapport.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rapport.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rapport.statut?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentRapports = filteredRapports.slice(indexOfFirstRapport, indexOfLastRapport);
  const totalPages = Math.ceil(filteredRapports.length / rapportsPerPage);

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
    fetchRapports();
  }, []);

  const fetchRapports = async () => {
    setLoading(true);
    try {
      let endpoint = "/rapports";
      // Si l'utilisateur est un stagiaire, il devrait voir seulement ses rapports
      // if (userRole === "STAGIAIRE") {
      //   endpoint = "/rapports/mes-rapports";
      // }
      const response = await api.get(endpoint);
      setRapports(response.data);
    } catch (error) {
      console.error("Erreur chargement rapports:", error);
      alert("Erreur lors du chargement des rapports");
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
      titre: "",
      fichier: ""
    });
    setShowForm(false);
    setCurrentPage(1);
  };

  // Soumettre un rapport (pour les stagiaires)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titre || !form.fichier) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await api.post("/rapports", form);
      alert("Rapport déposé avec succès");
      resetForm();
      fetchRapports();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors du dépôt du rapport");
    }
  };

  // Mettre à jour le statut (pour les ADMIN_RH)
  const updateStatut = async (id, statut) => {
    try {
      await api.put(`/rapports/${id}`, { statut });
      alert(`Rapport ${statut.toLowerCase()} avec succès`);
      fetchRapports();
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // Télécharger un rapport
  const telechargerRapport = (fichierUrl) => {
    if (fichierUrl) {
      window.open(fichierUrl, '_blank');
    } else {
      alert("Aucun fichier disponible");
    }
  };

  // Fonction pour obtenir le style du statut
  const getStatutStyle = (statut) => {
    switch (statut) {
      case "Publié":
        return { background: "#2ecc71", color: "white" };
      case "Archivé":
        return { background: "#95a5a6", color: "white" };
      case "Brouillon":
        return { background: "#f39c12", color: "white" };
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
        <h1 style={{ margin: 0, color: "#2c3e50" }}>📘 Gestion des Rapports</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Barre de recherche */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher un rapport..."
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

          {/* Bouton Déposer un rapport (seulement pour les stagiaires) */}
          {userRole === "STAGIAIRE" && (
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
              ➕ Déposer un rapport
            </button>
          )}
        </div>
      </div>

      {/* Formulaire de dépôt de rapport (seulement pour les stagiaires) */}
      {showForm && userRole === "STAGIAIRE" && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            📝 Déposer un nouveau rapport
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "15px",
            maxWidth: "500px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Titre du rapport *</label>
              <input
                type="text"
                name="titre"
                value={form.titre}
                onChange={handleInputChange}
                placeholder="Titre du rapport..."
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
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Lien du fichier *</label>
              <input
                type="url"
                name="fichier"
                value={form.fichier}
                onChange={handleInputChange}
                placeholder="https://example.com/rapport.pdf"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
              <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                🔗 Collez le lien vers votre rapport (Google Drive, Dropbox, etc.)
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
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
                Déposer le rapport
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination */}
      {filteredRapports.length > 0 && (
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
            Affichage de {indexOfFirstRapport + 1} à {Math.min(indexOfLastRapport, filteredRapports.length)} sur {filteredRapports.length} rapport(s)
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
            <span style={{ fontSize: "14px", color: "#6c757d" }}>Rapports par page:</span>
            <select
              value={rapportsPerPage}
              onChange={(e) => {
                setRapportsPerPage(Number(e.target.value));
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

      {/* Tableau des rapports */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des rapports...
          </div>
        ) : filteredRapports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm ? "Aucun rapport trouvé" : "Aucun rapport déposé"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Stagiaire</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Titre</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Fichier</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date dépôt</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Statut</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRapports.map((rapport, index) => (
                  <tr 
                    key={rapport._id}
                    style={{ 
                      background: index % 2 === 0 ? "#f8f9fa" : "white",
                      borderBottom: "1px solid #e9ecef"
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "500" }}>
                        {rapport.user ? `${rapport.user.nom} ${rapport.user.prenom}` : "-"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                        {rapport.user?.role}
                        {rapport.user?.service?.nomService && ` • ${rapport.user.service.nomService}`}
                        {rapport.user?.poste && (
                          <div style={{ marginTop: "2px" }}>
                            📝 {rapport.user.poste}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "15px", fontWeight: "500" }}>
                      {rapport.titre}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {rapport.fichier ? (
                        <button
                          onClick={() => telechargerRapport(rapport.fichier)}
                          style={{
                            background: "#3498db",
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
                          📄 Télécharger
                        </button>
                      ) : (
                        <span style={{ color: "#bdc3c7", fontStyle: "italic" }}>Aucun fichier</span>
                      )}
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {new Date(rapport.dateDepot).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        ...getStatutStyle(rapport.statut)
                      }}>
                        {rapport.statut}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                        {/* Actions pour ADMIN_RH */}
                        {userRole === "ADMIN_RH" && (
                          <>
                            {rapport.statut !== "Publié" && (
                              <button
                                onClick={() => updateStatut(rapport._id, "Publié")}
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
                                ✅ Publier
                              </button>
                            )}
                            {rapport.statut !== "Archivé" && (
                              <button
                                onClick={() => updateStatut(rapport._id, "Archivé")}
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
                                📁 Archiver
                              </button>
                            )}
                            {rapport.statut !== "Brouillon" && (
                              <button
                                onClick={() => updateStatut(rapport._id, "Brouillon")}
                                style={{
                                  background: "#f39c12",
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
                                📝 Brouillon
                              </button>
                            )}
                          </>
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total rapports</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{rapports.length}</div>
        </div>
        
        <div style={{
          background: "#f39c12",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Brouillons</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {rapports.filter(r => r.statut === "Brouillon").length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Publiés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {rapports.filter(r => r.statut === "Publié").length}
          </div>
        </div>
        
        <div style={{
          background: "#95a5a6",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Archivés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {rapports.filter(r => r.statut === "Archivé").length}
          </div>
        </div>
      </div>
    </div>
  );
}