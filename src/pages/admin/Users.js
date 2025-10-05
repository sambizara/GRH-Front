import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  
  // État pour les onglets
  const [activeTab, setActiveTab] = useState('tous');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sexe: "Homme",
    role: "SALARIE",
    motDePasse: "",
    service: "",
    poste: "",
    dateNaissance: "2000-01-01",
    adresse: "Non spécifiée",
    // Champs spécifiques aux salariés
    dateEmbauche: new Date().toISOString().split('T')[0],
    // Champs spécifiques aux stagiaires
    ecole: "",
    filiere: "",
    niveau: "L3",
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Filtrer les utilisateurs par onglet actif
  const getFilteredUsers = () => {
    let filtered = users.filter(user =>
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.service && user.service.nom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.poste && user.poste.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Appliquer le filtre d'onglet
    if (activeTab !== 'tous') {
      filtered = filtered.filter(user => user.role === activeTab);
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  
  // Calculs pour la pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Réinitialiser la pagination quand l'onglet change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

   // ✅ NOUVEAU: Fonction pour déterminer les colonnes à afficher
  const getTableHeaders = () => {
    const baseHeaders = [
      { key: 'nom', label: 'Nom & Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Rôle' }
    ];

    if (activeTab === 'tous') {
      return [
        ...baseHeaders,
        { key: 'service', label: 'Service' },
        { key: 'poste', label: 'Poste' },
        { key: 'dateCreation', label: 'Date création' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    if (activeTab === 'SALARIE') {
      return [
        ...baseHeaders,
        { key: 'service', label: 'Service' },
        { key: 'poste', label: 'Poste' },
        { key: 'dateEmbauche', label: 'Date embauche' },
        { key: 'salaire', label: 'Salaire' },
        { key: 'dateCreation', label: 'Date création' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    if (activeTab === 'STAGIAIRE') {
      return [
        ...baseHeaders,
        { key: 'ecole', label: 'École' },
        { key: 'filiere', label: 'Filière' },
        { key: 'niveau', label: 'Niveau' },
        { key: 'dateDebut', label: 'Début stage' },
        { key: 'dateFin', label: 'Fin stage' },
        { key: 'service', label: 'Service' },
        { key: 'dateCreation', label: 'Date création' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    if (activeTab === 'ADMIN_RH') {
      return [
        ...baseHeaders,
        { key: 'dateCreation', label: 'Date création' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    return baseHeaders;
  };

   // ✅ NOUVEAU: Fonction pour afficher le contenu des cellules
  const renderCellContent = (user, columnKey) => {
    switch (columnKey) {
      case 'nom':
        return (
          <div style={{ fontWeight: "500" }}>
            {user.nom} {user.prenom}
          </div>
        );

      case 'email':
        return (
          <div style={{ color: "#2980b9" }}>
            {user.email}
          </div>
        );

      case 'role':
        return (
          <span style={{
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
            background: 
              user.role === "ADMIN_RH" ? "#e74c3c" :
              user.role === "SALARIE" ? "#3498db" : "#2ecc71",
            color: "white"
          }}>
            {user.role}
          </span>
        );

      case 'service':
        return user.service ? user.service.nomService : "-";

      case 'poste':
        return user.poste ? (
          <span style={{
            display: "inline-block",
            background: "#e3f2fd",
            color: "#1976d2",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "500"
          }}>
            {user.poste}
          </span>
        ) : "-";

      case 'dateEmbauche':
        return user.dateEmbauche ? (
          <div style={{ fontSize: "13px", color: "#7f8c8d" }}>
            {new Date(user.dateEmbauche).toLocaleDateString('fr-FR')}
          </div>
        ) : "-";

      case 'salaire':
        // Vous pouvez ajouter le salaire plus tard quand vous l'aurez dans votre modèle
        return "-";

      case 'ecole':
        return user.ecole || "-";

      case 'filiere':
        return user.filiere || "-";

      case 'niveau':
        return user.niveau ? (
          <span style={{
            display: "inline-block",
            background: "#e8f5e9",
            color: "#2e7d32",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "500"
          }}>
            {user.niveau}
          </span>
        ) : "-";

      case 'dateDebut':
        return user.dateDebut ? (
          <div style={{ fontSize: "13px", color: "#7f8c8d" }}>
            {new Date(user.dateDebut).toLocaleDateString('fr-FR')}
          </div>
        ) : "-";

      case 'dateFin':
        return user.dateFin ? (
          <div style={{ fontSize: "13px", color: "#7f8c8d" }}>
            {new Date(user.dateFin).toLocaleDateString('fr-FR')}
          </div>
        ) : "-";

      case 'dateCreation':
        return (
          <div style={{ fontSize: "13px", color: "#7f8c8d" }}>
            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
          </div>
        );

      case 'actions':
        return (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <button
              onClick={() => handleEdit(user)}
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
              onClick={() => handleDelete(user)}
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
        );

      default:
        return "-";
    }
  };

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

  // Charger les utilisateurs ET les services
  useEffect(() => {
    fetchUsers();
    fetchServices();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      alert("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Charger la liste des services
  const fetchServices = async () => {
    try {
      const response = await api.get("/services");
      setServices(response.data);
    } catch (error) {
      console.error("Erreur chargement services:", error);
      alert("Erreur lors du chargement des services");
    }
  };

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "service") {
      setForm(prev => ({ 
        ...prev, 
        service: value,
        poste: ""
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      sexe: "Homme",
      role: "SALARIE",
      motDePasse: "",
      service: "",
      poste: "",
      dateNaissance: "2000-01-01",
      adresse: "Non spécifiée",
      dateEmbauche: new Date().toISOString().split('T')[0],
      ecole: "",
      filiere: "",
      niveau: "L3",
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setEditingUser(null);
    setShowForm(false);
    setCurrentPage(1);
  };

  // Vérifier si le service est requis
  const isServiceRequired = () => {
    return form.role === "SALARIE" || form.role === "STAGIAIRE";
  };

  // Ajouter un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nom || !form.prenom || !form.email || !form.role) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!form.sexe || !["Homme", "Femme"].includes(form.sexe)) {
      alert("Veuillez sélectionner un sexe valide (Homme ou Femme)");
      return;
    }

    if (isServiceRequired() && !form.service) {
      alert("Veuillez sélectionner un service pour un salarié ou stagiaire");
      return;
    }

    if (!editingUser && !form.motDePasse) {
      alert("Veuillez saisir un mot de passe pour le nouvel utilisateur");
      return;
    }

    try {
      const userData = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        sexe: form.sexe,
        role: form.role,
        password: form.motDePasse,
        dateNaissance: form.dateNaissance,
        adresse: form.adresse
      };

      if (form.role === "SALARIE") {
        userData.dateEmbauche = form.dateEmbauche;
        userData.poste = form.poste || "";
        userData.service = form.service;
      } 
      else if (form.role === "STAGIAIRE") {
        userData.ecole = form.ecole || "École à définir";
        userData.filiere = form.filiere || "Filière à définir";
        userData.niveau = form.niveau;
        userData.dateDebut = form.dateDebut;
        userData.dateFin = form.dateFin;
        userData.service = form.service;
      }

      console.log("📤 Données envoyées:", userData);

      if (editingUser) {
        if (!userData.password) {
          delete userData.password;
        }
        await api.put(`/users/${editingUser._id}`, userData);
        alert("Utilisateur modifié avec succès");
      } else {
        await api.post("/users", userData);
        alert("Utilisateur créé avec succès");
      }
      
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  // Modifier un utilisateur
  const handleEdit = (user) => {
    console.log("✏️ Modification user:", user);
    setEditingUser(user);
    setForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      sexe: user.sexe,
      role: user.role,
      motDePasse: "",
      service: user.service?._id || "",
      poste: user.poste || "",
      dateNaissance: user.dateNaissance ? new Date(user.dateNaissance).toISOString().split('T')[0] : "2000-01-01",
      adresse: user.adresse || "Non spécifiée",
      dateEmbauche: user.dateEmbauche ? new Date(user.dateEmbauche).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      ecole: user.ecole || "",
      filiere: user.filiere || "",
      niveau: user.niveau || "L3",
      dateDebut: user.dateDebut ? new Date(user.dateDebut).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dateFin: user.dateFin ? new Date(user.dateFin).toISOString().split('T')[0] : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  // Supprimer un utilisateur
  const handleDelete = async (user) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ${user.prenom} ?`)) {
      return;
    }

    try {
      await api.delete(`/users/${user._id}`);
      alert("Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Obtenir le nombre d'utilisateurs par rôle
  const getUserCountByRole = (role) => {
    return users.filter(user => user.role === role).length;
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* En-tête avec bouton d'ajout et recherche */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>👥 Gestion des Utilisateurs</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Barre de recherche */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
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
              background: "#2ea760ff",
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
            ➕ Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
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
            gap: "6px",
            transition: "all 0.3s ease"
          }}
        >
          👥 Tous les utilisateurs
          <span style={{
            background: activeTab === 'tous' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'tous' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SALARIE')}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            background: activeTab === 'SALARIE' ? "#3498db" : "transparent",
            color: activeTab === 'SALARIE' ? "white" : "#7f8c8d",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.3s ease"
          }}
        >
          💼 Salariés
          <span style={{
            background: activeTab === 'SALARIE' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'SALARIE' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {getUserCountByRole('SALARIE')}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('STAGIAIRE')}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            background: activeTab === 'STAGIAIRE' ? "#2ecc71" : "transparent",
            color: activeTab === 'STAGIAIRE' ? "white" : "#7f8c8d",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.3s ease"
          }}
        >
          🎓 Stagiaires
          <span style={{
            background: activeTab === 'STAGIAIRE' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'STAGIAIRE' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {getUserCountByRole('STAGIAIRE')}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ADMIN_RH')}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            background: activeTab === 'ADMIN_RH' ? "#e74c3c" : "transparent",
            color: activeTab === 'ADMIN_RH' ? "white" : "#7f8c8d",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.3s ease"
          }}
        >
          🔧 Admins RH
          <span style={{
            background: activeTab === 'ADMIN_RH' ? "rgba(255,255,255,0.2)" : "#e9ecef",
            color: activeTab === 'ADMIN_RH' ? "white" : "#7f8c8d",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {getUserCountByRole('ADMIN_RH')}
          </span>
        </button>
      </div>

      {/* Indicateur de filtre actif */}
      {activeTab !== 'tous' && (
        <div style={{
          background: "#e3f2fd",
          border: "1px solid #bbdefb",
          borderRadius: "6px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ color: "#1976d2", fontSize: "18px" }}>🔍</span>
          <div>
            <strong style={{ color: "#1976d2" }}>
              Filtre actif : {activeTab === 'SALARIE' ? 'Salariés' : activeTab === 'STAGIAIRE' ? 'Stagiaires' : 'Admins RH'}
            </strong>
            <div style={{ fontSize: "14px", color: "#546e7a", marginTop: "2px" }}>
              Affichage de {filteredUsers.length} utilisateur(s) sur {users.length} au total
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tous')}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "1px solid #1976d2",
              color: "#1976d2",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            ✕ Supprimer le filtre
          </button>
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            {editingUser ? "✏️ Modifier l'utilisateur" : "➕ Ajouter un nouvel utilisateur"}
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px"
          }}>
            {/* Champs du formulaire */}
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Nom *</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
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
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={form.prenom}
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
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
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
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Sexe *</label>
              <select
                name="sexe"
                value={form.sexe}
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
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Date de naissance *</label>
              <input
                type="date"
                name="dateNaissance"
                value={form.dateNaissance}
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
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Adresse *</label>
              <input
                type="text"
                name="adresse"
                value={form.adresse}
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
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Rôle *</label>
              <select
                name="role"
                value={form.role}
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
                <option value="SALARIE">Salarié</option>
                <option value="ADMIN_RH">Admin RH</option>
                <option value="STAGIAIRE">Stagiaire</option>
              </select>
            </div>

            {/* Champs spécifiques pour SALARIE */}
            {form.role === "SALARIE" && (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Date d'embauche *</label>
                  <input
                    type="date"
                    name="dateEmbauche"
                    value={form.dateEmbauche}
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
              </>
            )}

            {/* Champs spécifiques pour STAGIAIRE */}
            {form.role === "STAGIAIRE" && (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>École *</label>
                  <input
                    type="text"
                    name="ecole"
                    value={form.ecole}
                    onChange={handleInputChange}
                    required
                    placeholder="Nom de l'école"
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
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Filière *</label>
                  <input
                    type="text"
                    name="filiere"
                    value={form.filiere}
                    onChange={handleInputChange}
                    required
                    placeholder="Filière d'étude"
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
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Niveau *</label>
                  <select
                    name="niveau"
                    value={form.niveau}
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
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
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
              </>
            )}

            {/* Sélection du service - Conditionnel */}
            {(form.role === "SALARIE" || form.role === "STAGIAIRE") && (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Service {services.length > 0 ? "*" : "(Aucun service disponible)"}
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleInputChange}
                    required={services.length > 0}
                    disabled={services.length === 0}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      background: services.length === 0 ? "#f5f5f5" : "white",
                      color: services.length === 0 ? "#999" : "inherit"
                    }}
                  >
                    <option value="">
                      {services.length === 0 ? "Aucun service disponible" : "Sélectionner un service"}
                    </option>
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.nomService} {service.postes?.length > 0 ? `(${service.postes.length} postes)` : ''}
                      </option>
                    ))}
                  </select>
                  {services.length === 0 && (
                    <div style={{ fontSize: "12px", color: "#e74c3c", marginTop: "5px" }}>
                      ⚠️ Aucun service trouvé. Vérifiez votre backend.
                    </div>
                  )}
                </div>

                {/* Sélection du poste - seulement pour SALARIE */}
                {form.role === "SALARIE" && form.service && (
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                      Poste
                    </label>
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
                      <option value="">Sélectionner un poste (optionnel)</option>
                      {services.find(s => s._id === form.service)?.postes?.map((poste, index) => (
                        <option key={index} value={poste}>
                          {poste}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "5px" }}>
                      {services.find(s => s._id === form.service)?.postes?.length || 0} poste(s) disponible(s)
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Mot de passe {!editingUser && "*"}
              </label>
              <input
                type="password"
                name="motDePasse"
                value={form.motDePasse}
                onChange={handleInputChange}
                required={!editingUser}
                placeholder={editingUser ? "Laisser vide pour ne pas modifier" : ""}
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
                {editingUser ? "Modifier" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
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
            Affichage de {indexOfFirstUser + 1} à {Math.min(indexOfLastUser, filteredUsers.length)} sur {filteredUsers.length} utilisateur(s)
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
            <span style={{ fontSize: "14px", color: "#6c757d" }}>Utilisateurs par page:</span>
            <select
              value={usersPerPage}
              onChange={(e) => {
                setUsersPerPage(Number(e.target.value));
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

      {/* Tableau des utilisateurs */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des utilisateurs...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm || activeTab !== 'tous' 
              ? `Aucun utilisateur trouvé ${activeTab !== 'tous' ? `pour les ${activeTab === 'SALARIE' ? 'salariés' : activeTab === 'STAGIAIRE' ? 'stagiaires' : 'admins RH'}` : ''}`
              : "Aucun utilisateur enregistré"
            }
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  {getTableHeaders().map(header => (
                    <th 
                      key={header.key}
                      style={{ 
                        padding: "15px", 
                        textAlign: header.key === 'actions' ? "center" : "left", 
                        fontSize: "14px",
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr 
                    key={user._id}
                    style={{ 
                      background: index % 2 === 0 ? "#f8f9fa" : "white",
                      borderBottom: "1px solid #e9ecef"
                    }}
                  >
                    {getTableHeaders().map(header => (
                      <td 
                        key={header.key}
                        style={{ 
                          padding: "15px",
                          textAlign: header.key === 'actions' ? "center" : "left"
                        }}
                      >
                        {renderCellContent(user, header.key)}
                      </td>
                    ))}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total utilisateurs</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{users.length}</div>
        </div>
        
        <div style={{
          background: "#e74c3c",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Admins RH</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {users.filter(u => u.role === "ADMIN_RH").length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Salariés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {users.filter(u => u.role === "SALARIE").length}
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
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Stagiaires</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {users.filter(u => u.role === "STAGIAIRE").length}
          </div>
        </div>

        <div style={{
          background: "#2e476bff",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Avec poste défini</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {users.filter(u => u.poste).length}
          </div>
        </div>
      </div>
    </div>
  );
}