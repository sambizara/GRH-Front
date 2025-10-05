import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Services() {
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    nomService: "",
    description: "",
    postes: []
  });
  const [newPoste, setNewPoste] = useState("");

  // ✅ NOUVEAU: État pour la vue détaillée
  const [selectedService, setSelectedService] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage, setServicesPerPage] = useState(6);

  useEffect(() => {
    fetchServices();
    fetchUsers();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/services");
      setServices(response.data);
    } catch (error) {
      console.error("Erreur chargement services:", error);
      alert("Erreur lors du chargement des services");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  // ✅ AMÉLIORÉ: Obtenir les utilisateurs d'un service
  const getUsersByService = (serviceId) => {
    return users.filter(
      (user) =>
        user.service && (user.service._id === serviceId || user.service === serviceId)
    );
  };

  const getUsersCountByService = (serviceId) => {
    return getUsersByService(serviceId).length;
  };

  // ✅ NOUVEAU: Afficher les utilisateurs d'un service
  const handleShowUsers = (service) => {
    setSelectedService(service);
    setShowUsersModal(true);
  };

  // Filtrage
  const filteredServices = services.filter(
    (service) =>
      service.nomService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.postes && service.postes.some(poste => 
        poste.toLowerCase().includes(searchTerm.toLowerCase())
      ))
  );

  // Pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

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
    setCurrentPage(1);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ nomService: "", description: "", postes: [] });
    setNewPoste("");
    setEditingService(null);
    setShowForm(false);
  };

  // Ajouter un poste dans le formulaire
  const handleAddPoste = () => {
    if (newPoste.trim() !== "") {
      setForm((prev) => ({
        ...prev,
        postes: [...prev.postes, newPoste.trim().toUpperCase()]
      }));
      setNewPoste("");
    }
  };

  const handleRemovePoste = (poste) => {
    setForm((prev) => ({
      ...prev,
      postes: prev.postes.filter((p) => p !== poste)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nomService.trim()) {
      alert("Veuillez saisir un nom pour le service");
      return;
    }

    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, form);
        alert("Service modifié avec succès");
      } else {
        await api.post("/services", form);
        alert("Service créé avec succès");
      }

      resetForm();
      fetchServices();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      nomService: service.nomService,
      description: service.description || "",
      postes: service.postes || []
    });
    setShowForm(true);
  };

  const handleDelete = async (service) => {
    const usersCount = getUsersCountByService(service._id);

    if (usersCount > 0) {
      if (
        !window.confirm(
          `Êtes-vous sûr de vouloir supprimer le service "${service.nomService}" ?\n\n` +
            `⚠️ Ce service contient ${usersCount} utilisateur(s). ` +
            `Cette action désassignera tous les utilisateurs de ce service.`
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          `Êtes-vous sûr de vouloir supprimer le service "${service.nomService}" ?`
        )
      ) {
        return;
      }
    }

    try {
      await api.delete(`/services/${service._id}`);
      alert("Service supprimé avec succès");
      fetchServices();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // ✅ NOUVEAU: Fonction pour obtenir la répartition par rôle
  const getRoleDistribution = (serviceUsers) => {
    const distribution = {
      SALARIE: 0,
      STAGIAIRE: 0,
      ADMIN_RH: 0
    };
    
    serviceUsers.forEach(user => {
      if (distribution.hasOwnProperty(user.role)) {
        distribution[user.role]++;
      }
    });
    
    return distribution;
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* HEADER */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>🏢 Gestion des Services</h1>
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: "10px 40px 10px 15px", 
                border: "1px solid #ddd", 
                borderRadius: "6px",
                width: "250px"
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
            ➕ Nouveau service
          </button>
        </div>
      </div>

      {/* FORM - Inchangé */}
      {showForm && (
        <div style={{ 
          background: "#f8f9fa", 
          padding: "25px", 
          borderRadius: "10px", 
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            {editingService ? "✏️ Modifier le service" : "➕ Ajouter un nouveau service"}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Nom du service *</label>
              <input
                type="text"
                name="nomService"
                value={form.nomService}
                onChange={handleInputChange}
                placeholder="Nom du service"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Description"
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  resize: "vertical"
                }}
              />
            </div>

            {/* Gestion des postes */}
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Postes :</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <input
                  type="text"
                  value={newPoste}
                  onChange={(e) => setNewPoste(e.target.value)}
                  placeholder="Ajouter un poste"
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}
                />
                <button 
                  type="button" 
                  onClick={handleAddPoste}
                  style={{
                    padding: "10px 15px",
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  ➕ Ajouter
                </button>
              </div>
              <div style={{ marginTop: "10px" }}>
                {form.postes.map((poste, index) => (
                  <div key={index} style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "#e3f2fd",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    margin: "5px 5px 5px 0",
                    fontSize: "14px"
                  }}>
                    {poste}
                    <button 
                      type="button" 
                      onClick={() => handleRemovePoste(poste)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: "8px",
                        color: "#e74c3c"
                      }}
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                onClick={resetForm}
                style={{
                  padding: "10px 20px",
                  background: "#95a5a6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
              <button 
                type="submit"
                style={{
                  padding: "10px 20px",
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                {editingService ? "💾 Modifier" : "✅ Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination - Inchangée */}
      {filteredServices.length > 0 && (
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
            Affichage de {indexOfFirstService + 1} à {Math.min(indexOfLastService, filteredServices.length)} sur {filteredServices.length} service(s)
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
            <span style={{ fontSize: "14px", color: "#6c757d" }}>Services par page:</span>
            <select
              value={servicesPerPage}
              onChange={(e) => {
                setServicesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 10px",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            >
              <option value={3}>3</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      )}

      {/* TABLE SERVICES - AMÉLIORÉE */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm ? "Aucun service trouvé" : "Aucun service enregistré"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Service</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Description</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Postes</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Utilisateurs</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.map((service, index) => {
                  const serviceUsers = getUsersByService(service._id);
                  const roleDistribution = getRoleDistribution(serviceUsers);
                  
                  return (
                    <tr 
                      key={service._id}
                      style={{ 
                        background: index % 2 === 0 ? "#f8f9fa" : "white",
                        borderBottom: "1px solid #e9ecef"
                      }}
                    >
                      <td style={{ padding: "15px", fontWeight: "500" }}>
                        <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "5px" }}>
                          {service.nomService}
                        </div>
                        <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                          {service.postes?.length || 0} poste(s) défini(s)
                        </div>
                      </td>
                      
                      <td style={{ padding: "15px", color: "#7f8c8d", maxWidth: "200px" }}>
                        {service.description ? (
                          <div>
                            {service.description.length > 100 
                              ? `${service.description.substring(0, 100)}...` 
                              : service.description
                            }
                          </div>
                        ) : (
                          <span style={{ fontStyle: "italic", color: "#bdc3c7" }}>
                            Aucune description
                          </span>
                        )}
                      </td>
                      
                      <td style={{ padding: "15px", minWidth: "200px" }}>
                        {service.postes && service.postes.length > 0 ? (
                          <div>
                            {service.postes.slice(0, 3).map((p, i) => (
                              <div key={i} style={{
                                display: "inline-block",
                                background: "#e3f2fd",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                margin: "2px",
                                color: "#1976d2",
                                fontWeight: "500"
                              }}>
                                {p}
                              </div>
                            ))}
                            {service.postes.length > 3 && (
                              <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                                +{service.postes.length - 3} autre(s)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#bdc3c7", fontStyle: "italic" }}>Aucun poste défini</span>
                        )}
                      </td>
                      
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                          <span style={{
                            display: "inline-block",
                            background: "#2ecc71",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            {serviceUsers.length}
                          </span>
                          
                          {serviceUsers.length > 0 && (
                            <div style={{ display: "flex", gap: "4px", fontSize: "10px" }}>
                              {roleDistribution.SALARIE > 0 && (
                                <span style={{ color: "#3498db" }}>💼{roleDistribution.SALARIE}</span>
                              )}
                              {roleDistribution.STAGIAIRE > 0 && (
                                <span style={{ color: "#2ecc71" }}>🎓{roleDistribution.STAGIAIRE}</span>
                              )}
                              {roleDistribution.ADMIN_RH > 0 && (
                                <span style={{ color: "#e74c3c" }}>🔧{roleDistribution.ADMIN_RH}</span>
                              )}
                            </div>
                          )}
                          
                          {serviceUsers.length > 0 && (
                            <button
                              onClick={() => handleShowUsers(service)}
                              style={{
                                background: "none",
                                border: "1px solid #3498db",
                                color: "#3498db",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "10px",
                                marginTop: "2px"
                              }}
                            >
                              👁️ Voir
                            </button>
                          )}
                        </div>
                      </td>
                      
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => handleEdit(service)}
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
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ NOUVEAU: Modal pour voir les utilisateurs du service */}
      {showUsersModal && selectedService && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "10px",
            padding: "25px",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid #eee",
              paddingBottom: "15px"
            }}>
              <h3 style={{ margin: 0, color: "#2c3e50" }}>
                👥 Utilisateurs du service : {selectedService.nomService}
              </h3>
              <button
                onClick={() => setShowUsersModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#7f8c8d"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <div style={{
                  background: "#e3f2fd",
                  padding: "10px 15px",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}>
                  <strong>Total :</strong> {getUsersCountByService(selectedService._id)} utilisateur(s)
                </div>
                <div style={{
                  background: "#e8f5e9",
                  padding: "10px 15px",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}>
                  <strong>Postes :</strong> {selectedService.postes?.length || 0} défini(s)
                </div>
              </div>
            </div>

            {getUsersByService(selectedService._id).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
                Aucun utilisateur assigné à ce service
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "14px" }}>Nom & Prénom</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "14px" }}>Email</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "14px" }}>Rôle</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "14px" }}>Poste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getUsersByService(selectedService._id).map((user, index) => (
                      <tr key={user._id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px" }}>
                          {user.nom} {user.prenom}
                        </td>
                        <td style={{ padding: "12px", color: "#2980b9" }}>
                          {user.email}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            background: 
                              user.role === "ADMIN_RH" ? "#e74c3c" :
                              user.role === "SALARIE" ? "#3498db" : "#2ecc71",
                            color: "white"
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {user.poste || (
                            <span style={{ color: "#bdc3c7", fontStyle: "italic" }}>Non défini</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistiques - Inchangées */}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total services</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{services.length}</div>
        </div>
        
        <div style={{
          background: "#2ecc71",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Services avec postes</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {services.filter(s => s.postes && s.postes.length > 0).length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total utilisateurs assignés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {users.filter(u => u.service).length}
          </div>
        </div>
      </div>

    </div>
  );
}