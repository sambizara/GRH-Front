import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [salariesDisponibles, setSalariesDisponibles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sexe: "Homme",
    role: "SALARIE",
    motDePasse: "",
    dateNaissance: "2000-01-01",
    adresse: "",
    telephone: "",
    // Champs spécifiques aux salariés
    dateEmbauche: new Date().toISOString().split('T')[0],
    matricule: "",
    situationFamiliale: "Célibataire",
    nombreEnfants: 0,
    // Champs spécifiques aux stagiaires
    ecole: "",
    filiere: "",
    niveau: "Licence 3",
    dureeStage: 6,
    poste: "",
    encadreur: ""
  });

  // Charger les salariés disponibles
  useEffect(() => {
    fetchSalariesDisponibles();
  }, []);

  // Charger les salariés disponibles
  const fetchSalariesDisponibles = async () => {
    try {
      const response = await api.get("/users/salaries/disponibles");
      setSalariesDisponibles(response.data.salaries || []);
      console.log("👥 Salariés disponibles:", response.data.salaries);
    } catch (error) {
      console.error("Erreur chargement salariés disponibles:", error);
      setSalariesDisponibles([]);
    }
  };

  // Filtrer les utilisateurs (seulement les actifs)
  const getFilteredUsers = () => {
    let filtered = users.filter(user =>
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.matricule && user.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.poste && user.poste.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (activeTab !== 'tous') {
      filtered = filtered.filter(user => user.role === activeTab);
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Fonction pour déterminer les colonnes à afficher
  const getTableHeaders = () => {
    const baseHeaders = [
      { key: 'nom', label: 'Nom & Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Rôle' }
    ];

    if (activeTab === 'tous') {
      return [
        ...baseHeaders,
        { key: 'matricule', label: 'Matricule' },
        { key: 'poste', label: 'Poste' },
        { key: 'dateCreation', label: 'Date création' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    if (activeTab === 'SALARIE') {
      return [
        ...baseHeaders,
        { key: 'matricule', label: 'Matricule' },
        { key: 'dateEmbauche', label: 'Date embauche' },
        { key: 'situationFamiliale', label: 'Situation' },
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
        { key: 'dureeStage', label: 'Durée (mois)' },
        { key: 'poste', label: 'Poste' },
        { key: 'encadreur', label: 'Encadreur' },
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

  // Fonction pour afficher le contenu des cellules
  const renderCellContent = (user, columnKey) => {
    switch (columnKey) {
      case 'nom':
        return (
          <div className="font-medium text-gray-900">
            {user.nom} {user.prenom}
          </div>
        );

      case 'email':
        return (
          <div className="text-gray-600">
            {user.email}
          </div>
        );

      case 'role':
        const roleStyles = {
          "ADMIN_RH": "bg-gray-100 text-gray-800 border border-gray-300",
          "SALARIE": "bg-blue-50 text-blue-800 border border-blue-200",
          "STAGIAIRE": "bg-green-50 text-green-800 border border-green-200"
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleStyles[user.role]}`}>
            {user.role}
          </span>
        );

      case 'matricule':
        return user.matricule ? (
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono font-bold border border-blue-200">
            {user.matricule}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        );

      case 'dateEmbauche':
        return user.dateEmbauche ? (
          <div className="text-sm text-gray-600">
            {new Date(user.dateEmbauche).toLocaleDateString('fr-FR')}
          </div>
        ) : "-";

      case 'situationFamiliale':
        return user.situationFamiliale ? (
          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
            {user.situationFamiliale}
          </span>
        ) : "-";

      case 'ecole':
        return user.ecole || "-";

      case 'filiere':
        return user.filiere || "-";

      case 'niveau':
        return user.niveau ? (
          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
            {user.niveau}
          </span>
        ) : "-";

      case 'dureeStage':
        return user.dureeStage ? (
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-bold border border-blue-200">
            {user.dureeStage} mois
          </span>
        ) : "-";

      case 'poste':
        return user.poste ? (
          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium border border-green-200">
            {user.poste}
          </span>
        ) : "-";

      case 'encadreur':
        if (user.encadreur) {
          const encadreur = salariesDisponibles.find(s => s._id === user.encadreur);
          return encadreur ? (
            <div className="text-sm">
              <div className="font-medium">{encadreur.nom} {encadreur.prenom}</div>
              <div className="text-gray-500 text-xs">{encadreur.posteActuel}</div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Chargement...</span>
          );
        }
        return <span className="text-gray-400 text-sm">-</span>;

      case 'dateCreation':
        return (
          <div className="text-sm text-gray-600">
            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
          </div>
        );

      case 'actions':
        return (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleEdit(user)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
            >
              <span>✏️</span>
              Modifier
            </button>
            <button
              onClick={() => handleDelete(user)}
              className="bg-red-200 hover:bg-red-300 text-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
            >
              <span>🗑️</span>
              Supprimer
            </button>
          </div>
        );

      default:
        return "-";
    }
  };

  // Navigation des pages
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

  // Charger les utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      alert("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
      dateNaissance: "2000-01-01",
      adresse: "",
      telephone: "",
      dateEmbauche: new Date().toISOString().split('T')[0],
      matricule: "",
      situationFamiliale: "Célibataire",
      nombreEnfants: 0,
      ecole: "",
      filiere: "",
      niveau: "Licence 3",
      dureeStage: 6,
      poste: "",
      encadreur: ""
    });
    setEditingUser(null);
    setShowModal(false);
  };

  // Ouvrir le modal pour ajouter un utilisateur
  const handleAddUser = () => {
    resetForm();
    setShowModal(true);
  };

  // Ajouter/Modifier un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nom || !form.prenom || !form.email || !form.role) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Vérification spécifique pour les salariés
    if (form.role === "SALARIE" && !form.matricule) {
      alert("Le matricule est obligatoire pour un salarié");
      return;
    }

    // Vérification spécifique pour les stagiaires
    if (form.role === "STAGIAIRE" && (!form.dureeStage || !form.encadreur)) {
      alert("La durée du stage et l'encadreur sont obligatoires pour un stagiaire");
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
        dateNaissance: form.dateNaissance,
        adresse: form.adresse,
        telephone: form.telephone
      };

      // Ajouter le mot de passe seulement si fourni
      if (form.motDePasse) {
        userData.password = form.motDePasse;
      }

      if (form.role === "SALARIE") {
        userData.dateEmbauche = form.dateEmbauche;
        userData.matricule = form.matricule;
        userData.situationFamiliale = form.situationFamiliale;
        userData.nombreEnfants = form.nombreEnfants;
      } 
      else if (form.role === "STAGIAIRE") {
        userData.ecole = form.ecole;
        userData.filiere = form.filiere;
        userData.niveau = form.niveau;
        userData.dureeStage = parseInt(form.dureeStage);
        userData.poste = form.poste;
        userData.encadreur = form.encadreur;
      }

      console.log("📤 Données envoyées:", userData);

      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, userData);
        
        // Recharger les données fraîches depuis le backend
        await fetchUsers();
        
        alert("Utilisateur modifié avec succès");
        resetForm();
      } else {
        const response = await api.post("/users", userData);
        setUsers(prevUsers => [...prevUsers, response.data.user]);
        alert("Utilisateur créé avec succès");
        resetForm();
      }
      
    } catch (error) {
      console.error("Erreur détaillée:", error);
      console.error("Réponse erreur:", error.response);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erreur lors de l'opération";
      
      if (errorMessage.includes("Matricule déjà utilisé") || errorMessage.includes("matricule")) {
        alert("Ce matricule est déjà utilisé par un autre salarié");
      } else if (errorMessage.includes("Email déjà utilisé") || errorMessage.includes("email")) {
        alert("Cet email est déjà utilisé");
      } else {
        alert(`Erreur: ${errorMessage}`);
      }
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
      motDePasse: "", // Toujours vide pour la modification
      dateNaissance: user.dateNaissance ? new Date(user.dateNaissance).toISOString().split('T')[0] : "2000-01-01",
      adresse: user.adresse || "",
      telephone: user.telephone || "",
      dateEmbauche: user.dateEmbauche ? new Date(user.dateEmbauche).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      matricule: user.matricule || "",
      situationFamiliale: user.situationFamiliale || "Célibataire",
      nombreEnfants: user.nombreEnfants || 0,
      ecole: user.ecole || "",
      filiere: user.filiere || "",
      niveau: user.niveau || "Licence 3",
      dureeStage: user.dureeStage || 6,
      poste: user.poste || "",
      encadreur: user.encadreur || ""
    });
    setShowModal(true);
  };

  // Supprimer un utilisateur
  const handleDelete = async (user) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ${user.prenom} ?\n\nCette action le désactivera mais conservera ses données.`)) {
      return;
    }

    try {
      console.log(`🗑️ Suppression de l'utilisateur: ${user._id}`);
      
      const response = await api.delete(`/users/${user._id}`);
      
      console.log("✅ Réponse suppression:", response.data);
      
      if (response.data.success) {
        // Mettre à jour la liste localement
        setUsers(prevUsers => prevUsers.filter(u => u._id !== user._id));
        alert("Utilisateur supprimé (désactivé) avec succès");
      } else {
        alert(response.data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      console.error("Détails erreur:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erreur lors de la suppression";
      
      alert(`Erreur: ${errorMessage}`);
    }
  };

  // Obtenir le nombre d'utilisateurs par rôle
  const getUserCountByRole = (role) => {
    return users.filter(user => user.role === role).length;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Indicateur de chargement */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              <span>Chargement...</span>
            </div>
          </div>
        </div>
      )}

      {/* En-tête avec bouton d'ajout et recherche */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email, matricule ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={handleAddUser}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <span>+</span>
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'tous', label: 'Tous les utilisateurs', count: users.length },
            { key: 'SALARIE', label: 'Salariés', count: getUserCountByRole('SALARIE') },
            { key: 'STAGIAIRE', label: 'Stagiaires', count: getUserCountByRole('STAGIAIRE') },
            { key: 'ADMIN_RH', label: 'Admins RH', count: getUserCountByRole('ADMIN_RH') }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[150px] px-4 py-3 rounded-md transition-all ${
                activeTab === tab.key 
                  ? 'bg-gray-800 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              } font-medium flex items-center justify-center gap-2`}
            >
              {tab.label}
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === tab.key ? 'bg-white bg-opacity-20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Indicateur de filtre actif */}
      {activeTab !== 'tous' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <span className="text-blue-600">🔍</span>
          <div>
            <strong className="text-blue-800">
              Filtre actif : {activeTab === 'SALARIE' ? 'Salariés' : activeTab === 'STAGIAIRE' ? 'Stagiaires' : 'Admins RH'}
            </strong>
            <div className="text-sm text-blue-600 mt-1">
              Affichage de {filteredUsers.length} utilisateur(s) sur {users.length} au total
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tous')}
            className="ml-auto border border-blue-600 text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors"
          >
            ✕ Supprimer le filtre
          </button>
        </div>
      )}

      {/* Modal pour ajouter/modifier un utilisateur */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* En-tête du modal */}
            <div className="bg-gray-800 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingUser ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Champs de base */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexe *</label>
                  <select
                    name="sexe"
                    value={form.sexe}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
                  >
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={form.dateNaissance}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                  <input
                    type="text"
                    name="adresse"
                    value={form.adresse}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Matricule *</label>
                      <input
                        type="text"
                        name="matricule"
                        value={form.matricule}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: SAL001, EMP2024..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Identifiant unique du salarié
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche *</label>
                      <input
                        type="date"
                        name="dateEmbauche"
                        value={form.dateEmbauche}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Situation familiale</label>
                      <select
                        name="situationFamiliale"
                        value={form.situationFamiliale}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
                      >
                        <option value="Célibataire">Célibataire</option>
                        <option value="Marié(e)">Marié(e)</option>
                        <option value="Divorcé(e)">Divorcé(e)</option>
                        <option value="Veuf(ve)">Veuf(ve)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'enfants</label>
                      <input
                        type="number"
                        name="nombreEnfants"
                        value={form.nombreEnfants}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>
                  </>
                )}

                {/* Champs spécifiques pour STAGIAIRE */}
                {form.role === "STAGIAIRE" && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">École *</label>
                      <input
                        type="text"
                        name="ecole"
                        value={form.ecole}
                        onChange={handleInputChange}
                        required
                        placeholder="Nom de l'école"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filière *</label>
                      <input
                        type="text"
                        name="filiere"
                        value={form.filiere}
                        onChange={handleInputChange}
                        required
                        placeholder="Filière d'étude"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
                      <select
                        name="niveau"
                        value={form.niveau}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
                      >
                        <option value="Licence 1">Licence 1</option>
                        <option value="Licence 2">Licence 2</option>
                        <option value="Licence 3">Licence 3</option>
                        <option value="Master 1">Master 1</option>
                        <option value="Master 2">Master 2</option>
                        <option value="Doctorat">Doctorat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée du stage (mois) *</label>
                      <input
                        type="number"
                        name="dureeStage"
                        value={form.dureeStage}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="24"
                        placeholder="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>

                    {/* Champ poste optionnel pour stagiaire */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                      <input
                        type="text"
                        name="poste"
                        value={form.poste}
                        onChange={handleInputChange}
                        placeholder="Poste optionnel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Poste optionnel pour le stagiaire
                      </p>
                    </div>

                    {/* Sélection de l'encadreur parmi les salariés disponibles */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Encadreur *</label>
                      <select
                        name="encadreur"
                        value={form.encadreur}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
                      >
                        <option value="">Sélectionner un encadreur</option>
                        {salariesDisponibles.length > 0 ? (
                          salariesDisponibles.map((salarie) => (
                            <option key={salarie._id} value={salarie._id}>
                              {salarie.nom} {salarie.prenom} - {salarie.posteActuel} 
                              {salarie.service ? ` (${salarie.service.nomService})` : ''}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Aucun salarié disponible</option>
                        )}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {salariesDisponibles.length} salarié(s) disponible(s) avec contrat actif
                      </p>
                      {salariesDisponibles.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          ⚠️ Aucun salarié disponible. Veuillez d'abord créer des salariés avec contrats actifs.
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe {!editingUser && "*"}
                  </label>
                  <input
                    type="password"
                    name="motDePasse"
                    value={form.motDePasse}
                    onChange={handleInputChange}
                    required={!editingUser}
                    placeholder={editingUser ? "Laisser vide pour ne pas modifier" : ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                {/* Boutons d'action */}
                <div className="md:col-span-2 flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                  >
                    {editingUser ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            Affichage de {indexOfFirstUser + 1} à {Math.min(indexOfLastUser, filteredUsers.length)} sur {filteredUsers.length} utilisateur(s)
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 border border-gray-300 rounded text-sm flex items-center gap-1 ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ◀ Précédent
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border border-gray-300 rounded text-sm min-w-[40px] ${
                    currentPage === page 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border border-gray-300 rounded text-sm flex items-center gap-1 ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Suivant ▶
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Utilisateurs par page:</span>
            <select
              value={usersPerPage}
              onChange={(e) => setCurrentPage(1)}
              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm || activeTab !== 'tous' 
              ? `Aucun utilisateur trouvé ${activeTab !== 'tous' ? `pour les ${activeTab === 'SALARIE' ? 'salariés' : activeTab === 'STAGIAIRE' ? 'stagiaires' : 'admins RH'}` : ''}`
              : "Aucun utilisateur enregistré"
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  {getTableHeaders().map(header => (
                    <th 
                      key={header.key}
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
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
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    {getTableHeaders().map(header => (
                      <td 
                        key={header.key}
                        className="px-4 py-3 text-sm border-t border-gray-200"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Total utilisateurs</div>
          <div className="text-2xl font-bold text-gray-800">{users.length}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Admins RH</div>
          <div className="text-2xl font-bold text-gray-800">
            {getUserCountByRole('ADMIN_RH')}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Salariés</div>
          <div className="text-2xl font-bold text-gray-800">
            {getUserCountByRole('SALARIE')}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Stagiaires</div>
          <div className="text-2xl font-bold text-gray-800">
            {getUserCountByRole('STAGIAIRE')}
          </div>
        </div>
      </div>
    </div>
  );
}