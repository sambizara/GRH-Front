import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Attestations() {
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [attestationsPerPage, setAttestationsPerPage] = useState(10);

  const [form, setForm] = useState({
    typeAttestation: "Travail",
    contenu: ""
  });

  // Calculs pour la pagination
  const indexOfLastAttestation = currentPage * attestationsPerPage;
  const indexOfFirstAttestation = indexOfLastAttestation - attestationsPerPage;
  const filteredAttestations = attestations.filter(attestation =>
    attestation.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attestation.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attestation.typeAttestation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attestation.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attestation.contenu?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentAttestations = filteredAttestations.slice(indexOfFirstAttestation, indexOfLastAttestation);
  const totalPages = Math.ceil(filteredAttestations.length / attestationsPerPage);

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
    fetchAttestations();
  }, []);

  const fetchAttestations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/attestations");
      setAttestations(response.data);
    } catch (error) {
      console.error("Erreur chargement attestations:", error);
      alert("Erreur lors du chargement des attestations");
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
      typeAttestation: "Travail",
      contenu: ""
    });
    setShowForm(false);
    setCurrentPage(1);
  };

  // Soumettre une demande d'attestation (pour les salariés/stagiaires)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.typeAttestation) {
      alert("Veuillez sélectionner un type d'attestation");
      return;
    }

    try {
      let endpoint = "/attestations/salarie/demande";
      if (userRole === "STAGIAIRE") {
        endpoint = "/attestations/stagiaire/demande";
      }

      await api.post(endpoint, form);
      alert("Demande d'attestation créée avec succès");
      resetForm();
      fetchAttestations();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de la création de la demande");
    }
  };

  // Générer une attestation (ADMIN_RH)
  const genererAttestation = async (id) => {
    try {
      await api.put(`/attestations/generer/${id}`);
      alert("Attestation générée avec succès");
      fetchAttestations();
    } catch (error) {
      console.error("Erreur génération:", error);
      alert("Erreur lors de la génération de l'attestation");
    }
  };

  // Télécharger une attestation
  const telechargerAttestation = async (id) => {
    try {
      const response = await api.get(`/attestations/download/${id}`, {
        responseType: 'blob'
      });
      
      // Créer un URL pour le blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation_${id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      alert(error.response?.data?.message || "Erreur lors du téléchargement");
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

  // Fonction pour obtenir le style du type d'attestation
  const getTypeAttestationStyle = (typeAttestation) => {
    switch (typeAttestation) {
      case "Travail":
        return { background: "#3498db", color: "white" };
      case "Salaire":
        return { background: "#27ae60", color: "white" };
      case "Stage":
        return { background: "#9b59b6", color: "white" };
      case "Autre":
        return { background: "#95a5a6", color: "white" };
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
        <h1 style={{ margin: 0, color: "#2c3e50" }}>📄 Gestion des Attestations</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Barre de recherche */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher une attestation..."
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

          {/* Bouton Demander une attestation (seulement pour les salariés/stagiaires) */}
          {(userRole === "SALARIE" || userRole === "STAGIAIRE") && (
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
              ➕ Nouvelle demande
            </button>
          )}
        </div>
      </div>

      {/* Formulaire de demande d'attestation (seulement pour les salariés/stagiaires) */}
      {showForm && (userRole === "SALARIE" || userRole === "STAGIAIRE") && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            📝 Nouvelle demande d'attestation
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Type d'attestation *</label>
              <select
                name="typeAttestation"
                value={form.typeAttestation}
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
                {userRole === "SALARIE" ? (
                  <>
                    <option value="Travail">Travail</option>
                    <option value="Salaire">Salaire</option>
                    <option value="Autre">Autre</option>
                  </>
                ) : (
                  <>
                    <option value="Stage">Stage</option>
                    <option value="Autre">Autre</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Contenu</label>
              <textarea
                name="contenu"
                value={form.contenu}
                onChange={handleInputChange}
                placeholder="Décrivez le contenu spécifique de votre attestation..."
                rows="4"
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
      {filteredAttestations.length > 0 && (
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
            Affichage de {indexOfFirstAttestation + 1} à {Math.min(indexOfLastAttestation, filteredAttestations.length)} sur {filteredAttestations.length} attestation(s)
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
            <span style={{ fontSize: "14px", color: "#6c757d" }}>Attestations par page:</span>
            <select
              value={attestationsPerPage}
              onChange={(e) => {
                setAttestationsPerPage(Number(e.target.value));
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

      {/* Tableau des attestations */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des attestations...
          </div>
        ) : filteredAttestations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm ? "Aucune attestation trouvée" : "Aucune attestation enregistrée"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Demandeur</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Type</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Contenu</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Statut</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date demande</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAttestations.map((attestation, index) => (
                  <tr 
                    key={attestation._id}
                    style={{ 
                      background: index % 2 === 0 ? "#f8f9fa" : "white",
                      borderBottom: "1px solid #e9ecef"
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "500" }}>
                        {attestation.user ? `${attestation.user.nom} ${attestation.user.prenom}` : "-"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                        {attestation.user?.role}
                        {attestation.user?.service?.nomService && ` • ${attestation.user.service.nomService}`}
                        {attestation.user?.poste && (
                          <div style={{ marginTop: "2px" }}>
                            📝 {attestation.user.poste}
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
                        ...getTypeAttestationStyle(attestation.typeAttestation)
                      }}>
                        {attestation.typeAttestation}
                      </span>
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d", maxWidth: "200px" }}>
                      {attestation.contenu || "Aucun contenu spécifique"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        ...getStatutStyle(attestation.statut)
                      }}>
                        {attestation.statut}
                      </span>
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {new Date(attestation.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                        {/* Actions pour ADMIN_RH */}
                        {userRole === "ADMIN_RH" && attestation.statut === "En Attente" && (
                          <button
                            onClick={() => genererAttestation(attestation._id)}
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
                            ⚙️ Générer
                          </button>
                        )}
                        
                        {/* Télécharger pour les attestations approuvées */}
                        {attestation.statut === "Approuvé" && (
                          <button
                            onClick={() => telechargerAttestation(attestation._id)}
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
                            ⬇️ Télécharger
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
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{attestations.length}</div>
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
            {attestations.filter(a => a.statut === "En Attente").length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Approuvées</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {attestations.filter(a => a.statut === "Approuvé").length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Rejetées</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {attestations.filter(a => a.statut === "Rejeté").length}
          </div>
        </div>
      </div>
    </div>
  );
}