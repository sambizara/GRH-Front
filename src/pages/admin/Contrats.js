import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Contrats() {
  const [contrats, setContrats] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

  // États pour les notifications d'expiration
  const [expiringContrats, setExpiringContrats] = useState({
    dans7Jours: [],
    dans15Jours: [],
    dans30Jours: []
  });
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const [expirationStats, setExpirationStats] = useState({
    expiresDans7Jours: 0,
    expiresDans15Jours: 0,
    expiresDans30Jours: 0,
    totalExpirant: 0
  });

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

  // Fonctions de filtrage et pagination
  const getFilteredContrats = () => {
    let filtered = contrats.filter(contrat => {
      const matchesSearch = 
        contrat.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.user?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.typeContrat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.poste?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filters.typeContrat || contrat.typeContrat === filters.typeContrat;
      const matchesStatut = !filters.statut || contrat.statut === filters.statut;
      const matchesService = !filters.service || 
        contrat.service?._id === filters.service || 
        contrat.service === filters.service;

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
    } else if (activeTab === 'alternance') {
      filtered = filtered.filter(contrat => contrat.typeContrat === "Alternance");
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

  // Charger les données
  useEffect(() => {
    fetchContrats();
    fetchUsers();
    fetchServices();
    fetchExpirationStats();
    fetchExpiringContrats();
  }, []);

  const fetchContrats = async () => {
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

  // 🔹 Charger les contrats expirants
  const fetchExpiringContrats = async () => {
    try {
      const response = await api.get("/contrat-notifications/expiring-contrats");
      if (response.data.success) {
        setExpiringContrats(response.data.contratsExpiring);
      }
    } catch (error) {
      console.error("Erreur chargement contrats expirants:", error);
    }
  };

  // 🔹 Charger les statistiques d'expiration
  const fetchExpirationStats = async () => {
    try {
      const response = await api.get("/contrat-notifications/expiration-stats");
      if (response.data.success) {
        setExpirationStats(response.data.stats);
      }
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
    }
  };

  // 🔹 Forcer la vérification des notifications
  const forceCheckNotifications = async () => {
    try {
      const response = await api.post("/contrat-notifications/check-notifications");
      if (response.data.success) {
        alert(response.data.message);
        fetchExpiringContrats();
        fetchExpirationStats();
      }
    } catch (error) {
      console.error("Erreur vérification notifications:", error);
    }
  };

  // Obtenir les postes disponibles pour un service
  const getPostesByService = (serviceId) => {
    const service = services.find(s => s._id === serviceId);
    return service?.postes || [];
  };

  // 🔹 Télécharger PDF d'un contrat
  const downloadContratPDF = async (contratId) => {
    try {
      const response = await api.get(`/pdf/contrats/${contratId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrat-${contratId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      alert("Erreur lors du téléchargement du PDF");
    }
  };

  // 🔹 Télécharger liste PDF
  const downloadContratsListPDF = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.typeContrat) queryParams.append('typeContrat', filters.typeContrat);
      if (filters.statut) queryParams.append('statut', filters.statut);
      if (filters.service) queryParams.append('service', filters.service);

      const response = await api.get(`/pdf/contrats?${queryParams}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'liste-contrats.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error("Erreur téléchargement liste PDF:", error);
      alert("Erreur lors du téléchargement de la liste PDF");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "typeContrat" && value === "CDI") {
      setForm(prev => ({ 
        ...prev, 
        [name]: value,
        dateFin: ""
      }));
    } else if (name === "service") {
      setForm(prev => ({ 
        ...prev, 
        [name]: value,
        poste: ""
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
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
    setShowModal(false);
    setCurrentPage(1);
  };

  // Ouvrir le modal pour ajouter
  const handleAddContrat = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.user || !form.typeContrat || !form.dateDebut || !form.service) {
      alert("Veuillez remplir tous les champs obligatoires (Utilisateur, Type de contrat, Date de début et Service)");
      return;
    }

    if (form.typeContrat === "CDD" && !form.dateFin) {
      alert("Veuillez spécifier une date de fin pour un CDD");
      return;
    }

    if (form.typeContrat === "CDD" && form.dateFin && form.dateDebut) {
      const dateDebut = new Date(form.dateDebut);
      const dateFin = new Date(form.dateFin);
      
      if (dateFin <= dateDebut) {
        alert("La date de fin doit être après la date de début");
        return;
      }
    }

    if (form.typeContrat !== "Stage") {
      if (!form.salaire) {
        alert("Le salaire est obligatoire pour ce type de contrat");
        return;
      }
      if (!form.poste) {
        alert("Le poste est obligatoire pour ce type de contrat");
        return;
      }
    }

    if (form.salaire && form.salaire < 0) {
      alert("Le salaire ne peut pas être négatif");
      return;
    }

    try {
      const contratData = {
        user: form.user,
        typeContrat: form.typeContrat,
        dateDebut: form.dateDebut,
        dateFin: form.typeContrat === "CDI" ? null : form.dateFin,
        statut: form.statut,
        poste: form.typeContrat === "Stage" ? undefined : form.poste,
        salaire: form.typeContrat === "Stage" ? undefined : parseFloat(form.salaire),
        service: form.service
      };

      console.log("📤 Données envoyées:", contratData);

      let response;
      if (editingContrat) {
        response = await api.put(`/contrats/${editingContrat._id}`, contratData);
      } else {
        response = await api.post("/contrats", contratData);
      }

      if (response.data.success) {
        alert(editingContrat ? "Contrat modifié avec succès" : "Contrat créé avec succès");
        resetForm();
        fetchContrats();
        fetchExpiringContrats();
        fetchExpirationStats();
      } else {
        throw new Error(response.data.message || "Erreur inconnue du serveur");
      }

    } catch (error) {
      console.error("❌ Erreur détaillée:", error);
      
      let errorMessage = "Erreur lors de l'opération";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorMessage = `Erreurs de validation: ${Array.isArray(validationErrors) ? validationErrors.join(', ') : validationErrors}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erreur: ${errorMessage}`);
    }
  };

  const handleEdit = (contrat) => {
    setEditingContrat(contrat);
    
    const formatDateForInput = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    setForm({
      user: contrat.user?._id || "",
      typeContrat: contrat.typeContrat,
      dateDebut: formatDateForInput(contrat.dateDebut),
      dateFin: formatDateForInput(contrat.dateFin),
      statut: contrat.statut,
      poste: contrat.poste || "",
      salaire: contrat.salaire || "",
      service: contrat.service?._id || contrat.service || ""
    });
    setShowModal(true);
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
        fetchExpiringContrats();
        fetchExpirationStats();
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

  const getStats = () => {
    const total = contrats.length;
    const actifs = contrats.filter(c => c.statut === "Actif" && (!c.dateFin || new Date(c.dateFin) > new Date())).length;
    const expires = contrats.filter(c => c.dateFin && new Date(c.dateFin) < new Date()).length;
    const cdi = contrats.filter(c => c.typeContrat === "CDI").length;
    const cdd = contrats.filter(c => c.typeContrat === "CDD").length;
    const alternance = contrats.filter(c => c.typeContrat === "Alternance").length;

    return { total, actifs, expires, cdi, cdd, alternance };
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

  const stats = getStats();

  if (error) {
    return (
      <div className="p-5 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">Erreur</h2>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchContrats();
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête avec recherche et boutons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Contrats</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Bouton Alertes Contrats */}
          <button
            onClick={() => setShowExpiringModal(true)}
            className="relative bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <span>🔔</span>
            Alertes Contrats
            {expirationStats.totalExpirant > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {expirationStats.totalExpirant}
              </span>
            )}
          </button>

          {/* Bouton Export PDF */}
          <button
            onClick={downloadContratsListPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <span>📄</span>
            Exporter PDF
          </button>

          {/* Recherche */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          <button
            onClick={handleAddContrat}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <span>+</span>
            Nouveau contrat
          </button>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingContrat ? "Modifier le contrat" : "Ajouter un nouveau contrat"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur *</label>
                  <select
                    name="user"
                    value={form.user}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.nom} {user.prenom} - {user.role} {user.matricule ? `(${user.matricule})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service *</label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poste *</label>
                  <select
                    name="poste"
                    value={form.poste}
                    onChange={handleInputChange}
                    required={form.typeContrat !== "Stage"}
                    disabled={!form.service}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  >
                    <option value="">
                      {!form.service 
                        ? "Sélectionnez d'abord un service" 
                        : "Sélectionner un poste"}
                    </option>
                    {form.service && getPostesByService(form.service).map((poste, index) => (
                      <option key={index} value={poste}>
                        {poste}
                      </option>
                    ))}
                    {form.service && (
                      <option value="Autre">Autre (à préciser)</option>
                    )}
                  </select>
                  {form.service && (
                    <div className="text-xs text-gray-500 mt-1">
                      {getPostesByService(form.service).length} poste(s) disponible(s) dans ce service
                    </div>
                  )}
                </div>

                {/* Champ pour poste personnalisé */}
                {form.poste === "Autre" && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Précisez le poste *</label>
                    <input
                      type="text"
                      name="posteCustom"
                      value={form.poste === "Autre" ? "" : form.poste}
                      onChange={(e) => setForm(prev => ({ ...prev, poste: e.target.value }))}
                      placeholder="Entrez le nom du poste..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat *</label>
                  <select
                    name="typeContrat"
                    value={form.typeContrat}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Alternance">Alternance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                  <input
                    type="date"
                    name="dateDebut"
                    value={form.dateDebut}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin {form.typeContrat === "CDD" ? "*" : ""}
                  </label>
                  <input
                    type="date"
                    name="dateFin"
                    value={form.dateFin}
                    onChange={handleInputChange}
                    required={form.typeContrat === "CDD"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                  {form.typeContrat === "CDD" && !form.dateFin && (
                    <div className="text-xs text-red-500 mt-1">
                      La date de fin est obligatoire pour un CDD
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                  <select
                    name="statut"
                    value={form.statut}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salaire (MGA) *</label>
                  <input
                    type="number"
                    name="salaire"
                    value={form.salaire}
                    onChange={handleInputChange}
                    required={form.typeContrat !== "Stage"}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                    {editingContrat ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALERTES CONTRATS EXPIRANTS */}
      {showExpiringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="bg-orange-500 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    🔔 Alertes - Contrats arrivant à expiration
                  </h3>
                  <p className="text-orange-100 text-sm">
                    Surveillance automatique des contrats arrivant à expiration
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={forceCheckNotifications}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                    title="Forcer la vérification"
                  >
                    🔄 Vérifier
                  </button>
                  <button
                    onClick={() => setShowExpiringModal(false)}
                    className="text-white hover:text-orange-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{expirationStats.expiresDans7Jours}</div>
                  <div className="text-sm text-red-800 font-medium">Expire dans 7 jours</div>
                  <div className="text-xs text-red-600 mt-1">Urgent</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{expirationStats.expiresDans15Jours}</div>
                  <div className="text-sm text-orange-800 font-medium">Expire dans 15 jours</div>
                  <div className="text-xs text-orange-600 mt-1">Rappel</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{expirationStats.expiresDans30Jours}</div>
                  <div className="text-sm text-yellow-800 font-medium">Expire dans 30 jours</div>
                  <div className="text-xs text-yellow-600 mt-1">Information</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{expirationStats.totalExpirant}</div>
                  <div className="text-sm text-blue-800 font-medium">Total à expirer</div>
                  <div className="text-xs text-blue-600 mt-1">Prochain 30 jours</div>
                </div>
              </div>

              {/* Liste des contrats expirants par catégorie */}
              <div className="space-y-6">
                {/* Contrats dans 7 jours */}
                {expiringContrats.dans7Jours.length > 0 && (
                  <div className="border border-red-200 rounded-lg">
                    <div className="bg-red-500 text-white px-4 py-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        🚨 URGENT - Expire dans 7 jours ({expiringContrats.dans7Jours.length})
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-red-50">
                              <th className="px-3 py-2 text-left text-red-800">Employé</th>
                              <th className="px-3 py-2 text-left text-red-800">Contrat</th>
                              <th className="px-3 py-2 text-left text-red-800">Service</th>
                              <th className="px-3 py-2 text-left text-red-800">Expire le</th>
                              <th className="px-3 py-2 text-left text-red-800">Jours restants</th>
                              <th className="px-3 py-2 text-left text-red-800">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expiringContrats.dans7Jours.map((contrat, index) => (
                              <tr key={index} className="border-b border-red-100">
                                <td className="px-3 py-2">
                                  <div className="font-medium">{contrat.user}</div>
                                  <div className="text-xs text-gray-500">{contrat.userMatricule}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                    {contrat.typeContrat}
                                  </span>
                                </td>
                                <td className="px-3 py-2">{contrat.service}</td>
                                <td className="px-3 py-2 font-medium text-red-600">
                                  {new Date(contrat.dateFin).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="inline-block bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                    {contrat.joursRestants} jour(s)
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => downloadContratPDF(contrat.contratId)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs mr-2"
                                  >
                                    📄 PDF
                                  </button>
                                  <button
                                    onClick={() => {
                                      const foundContrat = contrats.find(c => c._id === contrat.contratId);
                                      if (foundContrat) handleEdit(foundContrat);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    ✏️ Modifier
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contrats dans 15 jours */}
                {expiringContrats.dans15Jours.length > 0 && (
                  <div className="border border-orange-200 rounded-lg">
                    <div className="bg-orange-500 text-white px-4 py-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        ⚠️ RAPPEL - Expire dans 15 jours ({expiringContrats.dans15Jours.length})
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-orange-50">
                              <th className="px-3 py-2 text-left text-orange-800">Employé</th>
                              <th className="px-3 py-2 text-left text-orange-800">Contrat</th>
                              <th className="px-3 py-2 text-left text-orange-800">Service</th>
                              <th className="px-3 py-2 text-left text-orange-800">Expire le</th>
                              <th className="px-3 py-2 text-left text-orange-800">Jours restants</th>
                              <th className="px-3 py-2 text-left text-orange-800">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expiringContrats.dans15Jours.map((contrat, index) => (
                              <tr key={index} className="border-b border-orange-100">
                                <td className="px-3 py-2">
                                  <div className="font-medium">{contrat.user}</div>
                                  <div className="text-xs text-gray-500">{contrat.userMatricule}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                    {contrat.typeContrat}
                                  </span>
                                </td>
                                <td className="px-3 py-2">{contrat.service}</td>
                                <td className="px-3 py-2 font-medium text-orange-600">
                                  {new Date(contrat.dateFin).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="inline-block bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                                    {contrat.joursRestants} jour(s)
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => downloadContratPDF(contrat.contratId)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs mr-2"
                                  >
                                    📄 PDF
                                  </button>
                                  <button
                                    onClick={() => {
                                      const foundContrat = contrats.find(c => c._id === contrat.contratId);
                                      if (foundContrat) handleEdit(foundContrat);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    ✏️ Modifier
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contrats dans 30 jours */}
                {expiringContrats.dans30Jours.length > 0 && (
                  <div className="border border-yellow-200 rounded-lg">
                    <div className="bg-yellow-500 text-white px-4 py-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        📅 INFORMATION - Expire dans 30 jours ({expiringContrats.dans30Jours.length})
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-yellow-50">
                              <th className="px-3 py-2 text-left text-yellow-800">Employé</th>
                              <th className="px-3 py-2 text-left text-yellow-800">Contrat</th>
                              <th className="px-3 py-2 text-left text-yellow-800">Service</th>
                              <th className="px-3 py-2 text-left text-yellow-800">Expire le</th>
                              <th className="px-3 py-2 text-left text-yellow-800">Jours restants</th>
                              <th className="px-3 py-2 text-left text-yellow-800">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expiringContrats.dans30Jours.map((contrat, index) => (
                              <tr key={index} className="border-b border-yellow-100">
                                <td className="px-3 py-2">
                                  <div className="font-medium">{contrat.user}</div>
                                  <div className="text-xs text-gray-500">{contrat.userMatricule}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                    {contrat.typeContrat}
                                  </span>
                                </td>
                                <td className="px-3 py-2">{contrat.service}</td>
                                <td className="px-3 py-2 font-medium text-yellow-600">
                                  {new Date(contrat.dateFin).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="inline-block bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                                    {contrat.joursRestants} jour(s)
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => downloadContratPDF(contrat.contratId)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs mr-2"
                                  >
                                    📄 PDF
                                  </button>
                                  <button
                                    onClick={() => {
                                      const foundContrat = contrats.find(c => c._id === contrat.contratId);
                                      if (foundContrat) handleEdit(foundContrat);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    ✏️ Modifier
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {expirationStats.totalExpirant === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-lg font-medium">Aucun contrat n'arrive à expiration dans les 30 prochains jours</p>
                    <p className="text-sm text-gray-400 mt-2">La situation est sous contrôle !</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglets de navigation */}
      <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'tous', label: 'Tous les contrats', count: stats.total },
            { id: 'actifs', label: 'Contrats actifs', count: stats.actifs },
            { id: 'expires', label: 'Contrats expirés', count: stats.expires },
            { id: 'cdi', label: 'CDI', count: stats.cdi },
            { id: 'cdd', label: 'CDD', count: stats.cdd },
            { id: 'alternance', label: 'Alternance', count: stats.alternance },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[150px] px-4 py-3 rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-gray-800 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              } font-medium flex items-center justify-center gap-2`}
            >
              {tab.label}
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-white bg-opacity-20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h4 className="text-lg font-semibold text-blue-800">Filtres avancés</h4>
          <button
            onClick={resetFilters}
            className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 rounded transition-colors"
          >
            Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat</label>
            <select
              value={filters.typeContrat}
              onChange={(e) => handleFilterChange('typeContrat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            >
              <option value="">Tous les types</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Alternance">Alternance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            >
              <option value="">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Terminé">Terminé</option>
              <option value="Suspendu">Suspendu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
            <select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
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
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <div className="text-sm text-blue-800 font-medium">
              Filtres actifs: 
              {filters.typeContrat && ` Type: ${filters.typeContrat}`}
              {filters.statut && ` Statut: ${filters.statut}`}
              {filters.service && ` Service: ${services.find(s => s._id === filters.service)?.nomService}`}
              {activeTab !== 'tous' && ` Onglet: ${activeTab === 'actifs' ? 'Contrats actifs' : activeTab === 'expires' ? 'Contrats expirés' : activeTab === 'cdi' ? 'CDI' : activeTab === 'cdd' ? 'CDD' : 'Alternance'}`}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredContrats.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            Affichage de {indexOfFirstContrat + 1} à {Math.min(indexOfLastContrat, filteredContrats.length)} sur {filteredContrats.length} contrat(s)
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
            <span className="text-sm text-gray-600">Contrats par page:</span>
            <select
              value={contratsPerPage}
              onChange={(e) => {
                setContratsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
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

      {/* Tableau des contrats */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredContrats.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm || activeTab !== 'tous' || filters.typeContrat || filters.statut || filters.service
              ? "Aucun contrat trouvé avec les critères sélectionnés"
              : "Aucun contrat enregistré"
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Poste</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date début</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date fin</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Salaire</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentContrats.map((contrat, index) => {
                  const statutAffiche = getStatutColor(contrat.statut, contrat.dateFin);
                  
                  return (
                    <tr 
                      key={contrat._id}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {contrat.user ? `${contrat.user.nom} ${contrat.user.prenom}` : "-"}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${
                            contrat.user?.role === "ADMIN_RH" ? 'bg-red-500' :
                            contrat.user?.role === "SALARIE" ? 'bg-blue-500' : 'bg-green-500'
                          }`}>
                            {contrat.user?.role}
                          </span>
                          {contrat.user?.matricule && (
                            <span className="inline-block px-2 py-1 bg-gray-500 text-white rounded-full text-xs">
                              {contrat.user.matricule}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {contrat.poste ? (
                          <div>
                            <div className="font-medium text-gray-800">
                              {contrat.poste}
                            </div>
                            {contrat.service && (
                              <div className="text-xs text-gray-500">
                                {contrat.service.nomService}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            Non assigné
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          contrat.typeContrat === "CDI" ? 'bg-blue-500' :
                          contrat.typeContrat === "CDD" ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}>
                          {contrat.typeContrat}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}
                      </td>
                      
                      <td className="px-4 py-3 text-gray-600">
                        {contrat.dateFin ? new Date(contrat.dateFin).toLocaleDateString('fr-FR') : "-"}
                      </td>
                      
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {contrat.salaire ? `${contrat.salaire.toLocaleString('fr-FR')} MGA` : "-"}
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          statutAffiche === "Actif" ? 'bg-green-500' :
                          statutAffiche === "Terminé" ? 'bg-gray-500' :
                          statutAffiche === "Suspendu" ? 'bg-yellow-500' :
                          statutAffiche === "Expiré" ? 'bg-red-500' : 'bg-gray-400'
                        }`}>
                          {statutAffiche}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => downloadContratPDF(contrat._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                            title="Télécharger PDF"
                          >
                            <span>📄</span>
                            PDF
                          </button>
                          <button
                            onClick={() => handleEdit(contrat)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <span>✏️</span>
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(contrat)}
                            className="bg-gray-200 hover:bg-red-100 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <span>🗑️</span>
                            Supprimer
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Total contrats</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Contrats actifs</div>
          <div className="text-2xl font-bold text-gray-800">{stats.actifs}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">CDI</div>
          <div className="text-2xl font-bold text-gray-800">{stats.cdi}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Contrats expirés</div>
          <div className="text-2xl font-bold text-gray-800">{stats.expires}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">CDD</div>
          <div className="text-2xl font-bold text-gray-800">{stats.cdd}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Alternance</div>
          <div className="text-2xl font-bold text-gray-800">{stats.alternance}</div>
        </div>
      </div>
    </div>
  );
}