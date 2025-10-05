import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Contrats() {
  const [contrats, setContrats] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingContrat, setEditingContrat] = useState(null);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    typeContrat: '',
    statut: '',
    service: ''
  });

  const [activeTab, setActiveTab] = useState('tous');

  const [currentPage, setCurrentPage] = useState(1);
  const [contratsPerPage, setContratsPerPage] = useState(10);

  const [form, setForm] = useState({
    user: "",
    typeContrat: "CDI",
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: "",
    statut: "Actif",
    poste: "",
    salaire: "",
    service: ""
  });

  const getFilteredContrats = () => {
    let filtered = contrats.filter(contrat => {
      const matchesSearch = 
        contrat.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.typeContrat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.poste?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filters.typeContrat || contrat.typeContrat === filters.typeContrat;
      const matchesStatut = !filters.statut || contrat.statut === filters.statut;
      const matchesService = !filters.service || 
        contrat.user?.service?._id === filters.service || 
        contrat.user?.service === filters.service;

      return matchesSearch && matchesType && matchesStatut && matchesService;
    });

    if (activeTab === 'actifs') {
      filtered = filtered.filter(contrat => 
        contrat.statut === "Actif" && (!contrat.dateFin || new Date(contrat.dateFin) > new Date())
      );
    } else if (activeTab === 'expires') {
      filtered = filtered.filter(contrat => 
        contrat.dateFin && new Date(contrat.dateFin) < new Date()
      );
    } else if (activeTab === 'cdi') {
      filtered = filtered.filter(contrat => contrat.typeContrat === "CDI");
    } else if (activeTab === 'cdd') {
      filtered = filtered.filter(contrat => contrat.typeContrat === "CDD");
    }

    return filtered;
  };

  const filteredContrats = getFilteredContrats();
  
  const indexOfLastContrat = currentPage * contratsPerPage;
  const indexOfFirstContrat = indexOfLastContrat - contratsPerPage;
  const currentContrats = filteredContrats.slice(indexOfFirstContrat, indexOfLastContrat);
  const totalPages = Math.ceil(filteredContrats.length / contratsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, activeTab]);

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

  // Testez la connexion API au chargement du composant
useEffect(() => {
  const testAPI = async () => {
    try {
      console.log("🔍 Test de connexion API...");
      const testResponse = await api.get("/services");
      console.log("✅ API Services accessible:", testResponse.data.length, "services trouvés");
      
      const testUsers = await api.get("/users");
      console.log("✅ API Users accessible:", testUsers.data.length, "utilisateurs trouvés");
      
    } catch (error) {
      console.error("❌ Erreur de connexion API:", error);
    }
  };
  
  testAPI();
  fetchContrats();
  fetchUsers();
  fetchServices();
}, []);

  const fetchContrats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/contrats");
      
      if (response.data.success) {
        setContrats(response.data.contrats || []);
      } else {
        throw new Error(response.data.message || "Erreur de chargement");
      }
      
    } catch (error) {
      console.error("Erreur chargement contrats:", error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      const filteredUsers = response.data.filter(user => 
        user.role === "SALARIE" || user.role === "STAGIAIRE"
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get("/services");
      setServices(response.data.services || response.data || []);
    } catch (error) {
      console.error("Erreur chargement des services:", error);
      setServices([]);
    }
  };

  const getAllPostes = () => {
    const allPostes = [];
    services.forEach(service => {
      if (service.postes && Array.isArray(service.postes)) {
        service.postes.forEach(poste => {
          if (poste && !allPostes.includes(poste)) {
            allPostes.push(poste);
          }
        });
      }
    });
    return allPostes.sort();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      typeContrat: '',
      statut: '',
      service: ''
    });
    setSearchTerm("");
    setActiveTab('tous');
  };

  const resetForm = () => {
    setForm({
      user: "",
      typeContrat: "CDI",
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: "",
      statut: "Actif",
      poste: "",
      salaire: "",
      service: ""
    });
    setEditingContrat(null);
    setShowForm(false);
    setCurrentPage(1);
  };

  const validateContratData = (data) => {
  const errors = [];

  if (!data.user) errors.push("Utilisateur est requis");
  if (!data.typeContrat) errors.push("Type de contrat est requis");
  if (!data.dateDebut) errors.push("Date de début est requise");
  if (!data.salaire) errors.push("Salaire est requis");
  if (!data.service) errors.push("Service est requis");
  
  if (data.typeContrat === "CDD" && !data.dateFin) {
    errors.push("Date de fin est obligatoire pour un CDD");
  }
  
  if (data.salaire && data.salaire < 0) {
    errors.push("Le salaire ne peut pas être négatif");
  }

  return errors;
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.user || !form.typeContrat || !form.dateDebut || !form.salaire || !form.service) {
    alert("Veuillez remplir tous les champs obligatoires (Utilisateur, Type de contrat, Date de début, Salaire et Service)");
    return;
  }

  if (form.typeContrat === "CDD" && !form.dateFin) {
    alert("Veuillez spécifier une date de fin pour un CDD");
    return;
  }

  if (form.salaire < 0) {
    alert("Le salaire ne peut pas être négatif");
    return;
  }

  try {
    const contratData = {
      user: form.user,
      typeContrat: form.typeContrat,
      dateDebut: form.dateDebut,
      dateFin: form.dateFin || undefined,
      statut: form.statut,
      poste: form.poste || undefined,
      salaire: parseFloat(form.salaire),
      service: form.service
    };

    console.log("📤 Données envoyées au backend:", contratData);

    let response;
    if (editingContrat) {
      response = await api.put(`/contrats/${editingContrat._id}`, contratData);
    } else {
      response = await api.post("/contrats", contratData);
    }

    console.log("✅ Réponse du backend:", response.data);

    if (response.data.success) {
      alert(editingContrat ? "Contrat modifié avec succès" : "Contrat créé avec succès");
      resetForm();
      fetchContrats();
    } else {
      throw new Error(response.data.message || "Erreur inconnue du serveur");
    }

  } catch (error) {
    console.error("❌ Erreur détaillée:", error);
    console.error("❌ Réponse d'erreur:", error.response?.data);
    
    let errorMessage = "Erreur lors de l'opération";
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.errors) {
      // Si c'est une erreur de validation Mongoose
      const validationErrors = Object.values(error.response.data.errors).map(err => err.message);
      errorMessage = `Erreurs de validation: ${validationErrors.join(', ')}`;
    }
    
    alert(`Erreur: ${errorMessage}`);
  }
};

  const handleEdit = (contrat) => {
    setEditingContrat(contrat);
    setForm({
      user: contrat.user?._id || "",
      typeContrat: contrat.typeContrat,
      dateDebut: contrat.dateDebut ? new Date(contrat.dateDebut).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dateFin: contrat.dateFin ? new Date(contrat.dateFin).toISOString().split('T')[0] : "",
      statut: contrat.statut,
      poste: contrat.poste || "",
      salaire: contrat.salaire || "",
      service: contrat.service?._id || contrat.service || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (contrat) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le contrat de ${contrat.user?.nom} ${contrat.user?.prenom} ?`)) {
      return;
    }

    try {
      const response = await api.delete(`/contrats/${contrat._id}`);
      if (response.data.success) {
        alert("Contrat supprimé avec succès");
        fetchContrats();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert(error.response?.data?.message || error.message || "Erreur lors de la suppression");
    }
  };

  const getStatutColor = (statut, dateFin) => {
    if (statut !== "Actif") return statut;
    
    if (dateFin && new Date(dateFin) < new Date()) {
      return "Expiré";
    }
    return statut;
  };

  const getStatutStyle = (statut, dateFin) => {
    const actualStatut = getStatutColor(statut, dateFin);
    
    switch (actualStatut) {
      case "Actif":
        return { background: "#2ecc71", color: "white" };
      case "Terminé":
        return { background: "#95a5a6", color: "white" };
      case "Suspendu":
        return { background: "#f39c12", color: "white" };
      case "Expiré":
        return { background: "#e74c3c", color: "white" };
      default:
        return { background: "#bdc3c7", color: "white" };
    }
  };

  const getStats = () => {
    const total = contrats.length;
    const actifs = contrats.filter(c => c.statut === "Actif" && (!c.dateFin || new Date(c.dateFin) > new Date())).length;
    const expires = contrats.filter(c => c.dateFin && new Date(c.dateFin) < new Date()).length;
    const cdi = contrats.filter(c => c.typeContrat === "CDI").length;
    const cdd = contrats.filter(c => c.typeContrat === "CDD").length;
    const alternance = contrats.filter(c => c.typeContrat === "Alternance").length;

    return { total, actifs, expires, cdi, cdd, alternance };
  };

  const stats = getStats();

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#e74c3c" }}>
        <h2>Erreur</h2>
        <p>{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchContrats();
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
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>Gestion des Contrats</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher un contrat..."
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
            ➕ Nouveau contrat
          </button>
        </div>
      </div>

      <div style={{
        display: "flex",
        background: "#f8f9fa",
        borderRadius: "8px",
        padding: "4px",
        marginBottom: "20px",
        border: "1px solid #e9ecef"
      }}>
        <button
          onClick={() => setActiveTab('tous')}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            background: activeTab === 'tous' ? "#3498db" : "transparent",
            color: activeTab === 'tous' ? "white" : "#7f8c8d",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          Tous les contrats
          <span style={{
            background: activeTab === 'tous' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'tous' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('actifs')}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            background: activeTab === 'actifs' ? "#2ecc71" : "transparent",
            color: activeTab === 'actifs' ? "white" : "#7f8c8d",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          Contrats actifs
          <span style={{
            background: activeTab === 'actifs' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'actifs' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {stats.actifs}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('expires')}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            background: activeTab === 'expires' ? "#e74c3c" : "transparent",
            color: activeTab === 'expires' ? "white" : "#7f8c8d",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          Contrats expirés
          <span style={{
            background: activeTab === 'expires' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'expires' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {stats.expires}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cdi')}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            background: activeTab === 'cdi' ? "#3498db" : "transparent",
            color: activeTab === 'cdi' ? "white" : "#7f8c8d",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          CDI
          <span style={{
            background: activeTab === 'cdi' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'cdi' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {stats.cdi}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cdd')}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            background: activeTab === 'cdd' ? "#f39c12" : "transparent",
            color: activeTab === 'cdd' ? "white" : "#7f8c8d",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          CDD
          <span style={{
            background: activeTab === 'cdd' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'cdd' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {stats.cdd}
          </span>
        </button>
      </div>

      <div style={{
        background: "#e3f2fd",
        border: "1px solid #bbdefb",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h4 style={{ margin: 0, color: "#1976d2" }}>Filtres avancés</h4>
          <button
            onClick={resetFilters}
            style={{
              background: "none",
              border: "1px solid #1976d2",
              color: "#1976d2",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Réinitialiser
          </button>
        </div>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>Type de contrat</label>
            <select
              value={filters.typeContrat}
              onChange={(e) => handleFilterChange('typeContrat', e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                background: "white"
              }}
            >
              <option value="">Tous les types</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Alternance">Alternance</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>Statut</label>
            <select
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                background: "white"
              }}
            >
              <option value="">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Terminé">Terminé</option>
              <option value="Suspendu">Suspendu</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>Service</label>
            <select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                background: "white"
              }}
            >
              <option value="">Tous les services</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.nomService}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(filters.typeContrat || filters.statut || filters.service || activeTab !== 'tous') && (
          <div style={{ marginTop: "15px", padding: "10px", background: "#bbdefb", borderRadius: "4px" }}>
            <div style={{ fontSize: "14px", color: "#0d47a1", fontWeight: "500" }}>
              Filtres actifs: 
              {filters.typeContrat && ` Type: ${filters.typeContrat}`}
              {filters.statut && ` Statut: ${filters.statut}`}
              {filters.service && ` Service: ${services.find(s => s._id === filters.service)?.nomService}`}
              {activeTab !== 'tous' && ` Onglet: ${activeTab === 'actifs' ? 'Contrats actifs' : activeTab === 'expires' ? 'Contrats expirés' : activeTab === 'cdi' ? 'CDI' : 'CDD'}`}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            {editingContrat ? "Modifier le contrat" : "Ajouter un nouveau contrat"}
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Utilisateur *</label>
              <select
                name="user"
                value={form.user}
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
                <option value="">Sélectionner un utilisateur</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.nom} {user.prenom} - {user.role} {user.service ? `(${user.service.nomService})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Service *</label>
              <select
                name="service"
                value={form.service}
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
                <option value="">Sélectionner un service</option>
                {services.map(service => (
                  <option key={service._id} value={service._id}>
                    {service.nomService} {service.postes?.length > 0 ? `(${service.postes.length} postes)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Poste</label>
              <select
                name="poste"
                value={form.poste}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  background: "white"
                }}
              >
                <option value="">Sélectionner un poste</option>
                {form.service && services.find(s => s._id === form.service)?.postes?.map((poste, index) => (
                  <option key={index} value={poste}>
                    {poste}
                  </option>
                ))}
                {!form.service && getAllPostes().map((poste, index) => (
                  <option key={index} value={poste}>
                    {poste}
                  </option>
                ))}
                <option value="Autre">Autre (à préciser)</option>
              </select>
              {form.service && (
                <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                  {services.find(s => s._id === form.service)?.postes?.length || 0} poste(s) disponible(s) dans ce service
                </div>
              )}
            </div>

            {form.poste === "Autre" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Précisez le poste *</label>
                <input
                  type="text"
                  name="posteCustom"
                  placeholder="Entrez le nom du poste..."
                  onChange={(e) => setForm(prev => ({ ...prev, poste: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Type de contrat *</label>
              <select
                name="typeContrat"
                value={form.typeContrat}
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
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Alternance">Alternance</option>
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
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Date de fin {form.typeContrat === "CDD" ? "*" : ""}
              </label>
              <input
                type="date"
                name="dateFin"
                value={form.dateFin}
                onChange={handleInputChange}
                required={form.typeContrat === "CDD"}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
              {form.typeContrat === "CDD" && !form.dateFin && (
                <div style={{ fontSize: "12px", color: "#e74c3c", marginTop: "5px" }}>
                  La date de fin est obligatoire pour un CDD
                </div>
              )}
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
                <option value="Actif">Actif</option>
                <option value="Terminé">Terminé</option>
                <option value="Suspendu">Suspendu</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Salaire (MGA) *</label>
              <input
                type="number"
                name="salaire"
                value={form.salaire}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
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
                {editingContrat ? "Modifier" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredContrats.length > 0 && (
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
            Affichage de {indexOfFirstContrat + 1} à {Math.min(indexOfLastContrat, filteredContrats.length)} sur {filteredContrats.length} contrat(s)
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
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Précédent
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
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Suivant
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#6c757d" }}>Contrats par page:</span>
            <select
              value={contratsPerPage}
              onChange={(e) => {
                setContratsPerPage(Number(e.target.value));
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

      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des contrats...
          </div>
        ) : filteredContrats.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm ? "Aucun contrat trouvé" : "Aucun contrat enregistré"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Utilisateur</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Poste</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Type</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date début</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date fin</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Salaire</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Statut</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentContrats.map((contrat, index) => (
                  <tr 
                    key={contrat._id}
                    style={{ 
                      background: index % 2 === 0 ? "#f8f9fa" : "white",
                      borderBottom: "1px solid #e9ecef"
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "500" }}>
                        {contrat.user ? `${contrat.user.nom} ${contrat.user.prenom}` : "-"}
                      </div>
                      <div style={{ fontSize: "12px", marginTop: "5px" }}>
                        <span style={{
                          display: "inline-block",
                          background: 
                            contrat.user?.role === "ADMIN_RH" ? "#e74c3c" :
                            contrat.user?.role === "SALARIE" ? "#3498db" : "#2ecc71",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          marginRight: "5px",
                          fontSize: "10px"
                        }}>
                          {contrat.user?.role}
                        </span>
                        
                        {contrat.user?.service && (
                          <span style={{
                            display: "inline-block",
                            background: "#95a5a6",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            marginRight: "5px",
                            fontSize: "10px"
                          }}>
                            {contrat.user.service.nomService}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "15px" }}>
                      {contrat.poste ? (
                        <div>
                          <div style={{ 
                            fontWeight: "500", 
                            color: "#2c3e50",
                            marginBottom: "4px"
                          }}>
                            {contrat.poste}
                          </div>
                          {contrat.user?.service && (
                            <div style={{ 
                              fontSize: "12px", 
                              color: "#7f8c8d"
                            }}>
                              {contrat.user.service.nomService}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#95a5a6", fontStyle: "italic" }}>
                          Non assigné
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: 
                          contrat.typeContrat === "CDI" ? "#3498db" :
                          contrat.typeContrat === "CDD" ? "#f39c12" : "#a880b8ff",
                        color: "white"
                      }}>
                        {contrat.typeContrat}
                      </span>
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {new Date(contrat.dateDebut).toLocaleDateString('mg-MG')}
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {contrat.dateFin ? new Date(contrat.dateFin).toLocaleDateString('mg-MG') : "-"}
                    </td>
                    <td style={{ padding: "15px", fontWeight: "bold", color: "#27ae60" }}>
                      {contrat.salaire ? `${contrat.salaire.toLocaleString('mg-MG')} MGA` : "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        ...getStatutStyle(contrat.statut, contrat.dateFin)
                      }}>
                        {getStatutColor(contrat.statut, contrat.dateFin)}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleEdit(contrat)}
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
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(contrat)}
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
                          Supprimer
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total contrats</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.total}</div>
        </div>
        
        <div style={{
          background: "#2ecc71",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Contrats actifs</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.actifs}</div>
        </div>
        
        <div style={{
          background: "#f39c12",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>CDI</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.cdi}</div>
        </div>
        
        <div style={{
          background: "#e74c3c",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Contrats expirés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.expires}</div>
        </div>

        <div style={{
          background: "#9b59b6",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>CDD</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.cdd}</div>
        </div>

        <div style={{
          background: "#1abc9c",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Alternance</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.alternance}</div>
        </div>
      </div>
    </div>
  );
}