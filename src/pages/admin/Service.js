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
    description: ""
  });

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage, setServicesPerPage] = useState(6); // 6 services par page

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

  const getUsersCountByService = (serviceId) => {
    return users.filter(user => 
      user.service && (user.service._id === serviceId || user.service === serviceId)
    ).length;
  };

  // Filtrage des services
  const filteredServices = services.filter(service =>
    service.nomService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculs pour la pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  // Changer de page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Aller à la page précédente
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Aller à la page suivante
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Réinitialiser la pagination lors d'une recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      nomService: "",
      description: ""
    });
    setEditingService(null);
    setShowForm(false);
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
      description: service.description || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (service) => {
    const usersCount = getUsersCountByService(service._id);
    
    if (usersCount > 0) {
      if (!window.confirm(
        `Êtes-vous sûr de vouloir supprimer le service "${service.nomService}" ?\n\n` +
        `⚠️ Ce service contient ${usersCount} utilisateur(s). ` +
        `Cette action supprimera également tous les utilisateurs associés à ce service.`
      )) {
        return;
      }
    } else {
      if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.nomService}" ?`)) {
        return;
      }
    }

    try {
      await api.delete(`/services/${service._id}`);
      alert("Service supprimé avec succès");
      fetchServices();
      fetchUsers();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const getServiceStats = () => {
    const totalServices = services.length;
    const servicesWithUsers = services.filter(service => 
      getUsersCountByService(service._id) > 0
    ).length;
    const emptyServices = totalServices - servicesWithUsers;

    return { totalServices, servicesWithUsers, emptyServices };
  };

  const stats = getServiceStats();

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
        <h1 style={{ margin: 0, color: "#2c3e50" }}>🏢 Gestion des Services</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Barre de recherche */}
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

          {/* Bouton Ajouter */}
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

      {/* Statistiques */}
      <div style={{
        display: "flex",
        gap: "15px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <div style={{
          background: "#3498db",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          flex: "1",
          minWidth: "180px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total services</div>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stats.totalServices}</div>
        </div>
        
        <div style={{
          background: "#2ecc71",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          flex: "1",
          minWidth: "180px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Services utilisés</div>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stats.servicesWithUsers}</div>
        </div>
        
        <div style={{
          background: "#e74c3c",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          flex: "1",
          minWidth: "180px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Services vides</div>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stats.emptyServices}</div>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            {editingService ? "✏️ Modifier le service" : "➕ Ajouter un nouveau service"}
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "20px",
            alignItems: "start"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                Nom du service *
              </label>
              <input
                type="text"
                name="nomService"
                value={form.nomService}
                onChange={handleInputChange}
                required
                placeholder="Ex: Développement, Marketing..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  transition: "border-color 0.3s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#3498db"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Description du service..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical",
                  minHeight: "80px",
                  transition: "border-color 0.3s ease",
                  fontFamily: "inherit"
                }}
                onFocus={(e) => e.target.style.borderColor = "#3498db"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px" }}>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "#95a5a6",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "background 0.3s ease"
                }}
                onMouseOver={(e) => e.target.style.background = "#7f8c8d"}
                onMouseOut={(e) => e.target.style.background = "#95a5a6"}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "background 0.3s ease"
                }}
                onMouseOver={(e) => e.target.style.background = "#2980b9"}
                onMouseOut={(e) => e.target.style.background = "#3498db"}
              >
                {editingService ? "💾 Modifier" : "✅ Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des services */}
      <div style={{
        background: "white",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        marginBottom: "20px"
      }}>
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px", 
            color: "#7f8c8d",
            fontSize: "16px"
          }}>
            <div style={{ marginBottom: "15px" }}>⏳</div>
            Chargement des services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px", 
            color: "#7f8c8d" 
          }}>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🏢</div>
            <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
              {searchTerm ? "Aucun service trouvé" : "Aucun service enregistré"}
            </h3>
            <p style={{ margin: 0, fontSize: "14px" }}>
              {searchTerm ? "Essayez avec d'autres termes de recherche" : "Commencez par créer votre premier service"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              minWidth: "600px"
            }}>
              <thead>
                <tr style={{ 
                  background: "linear-gradient(135deg, #34495e, #2c3e50)",
                  color: "white"
                }}>
                  <th style={{ 
                    padding: "18px 20px", 
                    textAlign: "left", 
                    fontSize: "14px",
                    fontWeight: "600",
                    borderBottom: "2px solid #3498db"
                  }}>
                    Service
                  </th>
                  <th style={{ 
                    padding: "18px 20px", 
                    textAlign: "left", 
                    fontSize: "14px",
                    fontWeight: "600",
                    borderBottom: "2px solid #3498db"
                  }}>
                    Description
                  </th>
                  <th style={{ 
                    padding: "18px 20px", 
                    textAlign: "center", 
                    fontSize: "14px",
                    fontWeight: "600",
                    borderBottom: "2px solid #3498db",
                    width: "150px"
                  }}>
                    Utilisateurs
                  </th>
                  <th style={{ 
                    padding: "18px 20px", 
                    textAlign: "center", 
                    fontSize: "14px",
                    fontWeight: "600",
                    borderBottom: "2px solid #3498db",
                    width: "120px"
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentServices.map((service, index) => {
                  const usersCount = getUsersCountByService(service._id);
                  
                  return (
                    <tr 
                      key={service._id}
                      style={{ 
                        background: index % 2 === 0 ? "#f8f9fa" : "white",
                        borderBottom: "1px solid #e9ecef",
                        transition: "background 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#e3f2fd"}
                      onMouseLeave={(e) => e.target.style.background = index % 2 === 0 ? "#f8f9fa" : "white"}
                    >
                      <td style={{ 
                        padding: "16px 20px", 
                        fontWeight: "600",
                        color: "#2c3e50",
                        fontSize: "15px"
                      }}>
                        {service.nomService}
                      </td>
                      <td style={{ 
                        padding: "16px 20px", 
                        color: "#7f8c8d",
                        fontSize: "14px",
                        lineHeight: "1.4"
                      }}>
                        {service.description || (
                          <span style={{ fontStyle: "italic", color: "#bdc3c7" }}>
                            Aucune description
                          </span>
                        )}
                      </td>
                      <td style={{ 
                        padding: "16px 20px", 
                        textAlign: "center" 
                      }}>
                        <span style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          background: usersCount > 0 ? "#2ecc71" : "#95a5a6",
                          color: "white",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          minWidth: "30px"
                        }}>
                          {usersCount}
                        </span>
                      </td>
                      <td style={{ 
                        padding: "16px 20px", 
                        textAlign: "center" 
                      }}>
                        <div style={{ 
                          display: "flex", 
                          gap: "8px", 
                          justifyContent: "center" 
                        }}>
                          <button
                            onClick={() => handleEdit(service)}
                            style={{
                              background: "#f39c12",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "background 0.3s ease"
                            }}
                            onMouseOver={(e) => e.target.style.background = "#e67e22"}
                            onMouseOut={(e) => e.target.style.background = "#f39c12"}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            style={{
                              background: "#e74c3c",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "background 0.3s ease"
                            }}
                            onMouseOver={(e) => e.target.style.background = "#c0392b"}
                            onMouseOut={(e) => e.target.style.background = "#e74c3c"}
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

      {/* Pagination */}
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

      {/* Information */}
      <div style={{
        marginTop: "20px",
        padding: "15px",
        background: "#e3f2fd",
        border: "1px solid #bbdefb",
        borderRadius: "6px",
        fontSize: "13px",
        color: "#1565c0"
      }}>
        <strong>💡 Information :</strong> Les services permettent d'organiser les salariés et stagiaires par département. 
        Chaque service peut contenir plusieurs utilisateurs.
      </div>
    </div>
  );
}