import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Conges() {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [congesPerPage, setCongesPerPage] = useState(10);

  // État pour les onglets
  const [activeTab, setActiveTab] = useState('en-attente');

  const [form, setForm] = useState({
    typeConge: "Annuel",
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0],
    motif: ""
  });

  // Fonction pour générer les icônes Tailwind
  const getIcon = (iconName, isLarge = false) => {
    const iconClass = `w-5 h-5 ${isLarge ? 'w-6 h-6' : ''}`;
    
    switch(iconName) {
      case '📅': // Congés / Calendrier
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case '🔍': // Recherche
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case '➕': // Ajouter
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case '✅': // Approuver
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '❌': // Rejeter
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '🗑️': // Supprimer
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case '📝': // Modifier / Formulaire
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case '📊': // Statistiques
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case '◀': // Précédent
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        );
      case '▶': // Suivant
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        );
      case '✕': // Fermer
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case '⏳': // En attente
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '📋': // Tous
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return <span className={iconClass}>•</span>;
    }
  };

  // Fonction pour filtrer les congés selon l'onglet actif
  const getFilteredConges = () => {
    let filtered = conges.filter(conge =>
      conge.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conge.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conge.typeConge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conge.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conge.motif?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtrage par onglet
    if (activeTab === 'en-attente') {
      filtered = filtered.filter(conge => conge.statut === "En Attente");
    } else if (activeTab === 'approuves') {
      filtered = filtered.filter(conge => conge.statut === "Approuvé");
    } else if (activeTab === 'rejetes') {
      filtered = filtered.filter(conge => conge.statut === "Rejeté");
    }
    // 'tous' affiche tous les congés sans filtre supplémentaire

    return filtered;
  };

  // Calculs pour la pagination
  const filteredConges = getFilteredConges();
  const indexOfLastConge = currentPage * congesPerPage;
  const indexOfFirstConge = indexOfLastConge - congesPerPage;
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

  // Réinitialiser la page quand on change d'onglet ou de recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  useEffect(() => {
    fetchConges();
  }, []);

  const fetchConges = async () => {
    setLoading(true);
    try {
      let endpoint = "/conges/admin/tous";
      
      console.log("🌐 Chargement des congés admin...");
      const response = await api.get(endpoint);
      
      console.log("✅ Réponse admin:", response.data);
      
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
    setShowModal(false);
    setCurrentPage(1);
  };

  // Ouvrir le modal pour ajouter
  const handleAddConge = () => {
    resetForm();
    setShowModal(true);
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
      await api.put(`/conges/admin/${id}/statut`, { statut });
      alert(`Congé ${statut.toLowerCase()} avec succès`);
      fetchConges();
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error);
      alert(`Erreur lors de la mise à jour: ${error.response?.data?.message || error.message}`);
    }
  };

  // Fonction pour obtenir la classe du statut
  const getStatutClass = (statut) => {
    switch (statut) {
      case "Approuvé":
        return "bg-green-500 text-white";
      case "Rejeté":
        return "bg-red-500 text-white";
      case "En Attente":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Fonction pour obtenir la classe du type de congé
  const getTypeCongeClass = (typeConge) => {
    switch (typeConge) {
      case "Annuel":
        return "bg-gray-500 text-white";
      case "Maladie":
        return "bg-red-500 text-white";
      case "Sans Solde":
        return "bg-gray-500 text-white";
      case "Maternité":
        return "bg-purple-500 text-white";
      case "Paternité":
        return "bg-teal-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Obtenir les statistiques
  const getStats = () => {
    const total = conges.length;
    const enAttente = conges.filter(c => c.statut === "En Attente").length;
    const approuves = conges.filter(c => c.statut === "Approuvé").length;
    const rejetes = conges.filter(c => c.statut === "Rejeté").length;

    return { total, enAttente, approuves, rejetes };
  };

  const stats = getStats();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête avec bouton d'ajout et recherche */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          {getIcon('📅', true)}
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Congés</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Barre de recherche */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Rechercher un congé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {getIcon('🔍')}
            </div>
          </div>

          {/* Bouton Demander un congé (seulement pour les salariés) */}
          {userRole === "SALARIE" && (
            <button
              onClick={handleAddConge}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {getIcon('➕')}
              Demander un congé
            </button>
          )}
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && userRole === "SALARIE" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {getIcon('📝')}
                  Nouvelle demande de congé
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-gray-200"
                >
                  {getIcon('✕')}
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de congé *</label>
                  <select
                    name="typeConge"
                    value={form.typeConge}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                  >
                    <option value="Annuel">Annuel</option>
                    <option value="Maladie">Maladie</option>
                    <option value="Sans Solde">Sans solde</option>
                    <option value="Maternité">Maternité</option>
                    <option value="Paternité">Paternité</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin *</label>
                  <input
                    type="date"
                    name="dateFin"
                    value={form.dateFin}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motif</label>
                  <textarea
                    name="motif"
                    value={form.motif}
                    onChange={handleInputChange}
                    placeholder="Raison de la demande de congé..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-vertical"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                  >
                    Soumettre la demande
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('📊')}
            Total demandes
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('⏳')}
            En attente
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.enAttente}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('✅')}
            Approuvés
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.approuves}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('❌')}
            Rejetés
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.rejetes}</div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'tous', label: 'Tous les congés', count: stats.total, icon: '📋' },
            { key: 'en-attente', label: 'En attente', count: stats.enAttente, icon: '⏳' },
            { key: 'approuves', label: 'Approuvés', count: stats.approuves, icon: '✅' },
            { key: 'rejetes', label: 'Rejetés', count: stats.rejetes, icon: '❌' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[150px] px-4 py-3 rounded-md transition-all ${
                activeTab === tab.key 
                  ? 'bg-gray-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              } font-medium flex items-center justify-center gap-2`}
            >
              {getIcon(tab.icon)}
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
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="text-gray-600">
            {getIcon('🔍')}
          </div>
          <div>
            <strong className="text-gray-800">
              Filtre actif : {activeTab === 'en-attente' ? 'Congés en attente' : activeTab === 'approuves' ? 'Congés approuvés' : 'Congés rejetés'}
            </strong>
            <div className="text-sm text-gray-600 mt-1">
              Affichage de {filteredConges.length} congé(s) sur {conges.length} au total
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tous')}
            className="ml-auto border border-gray-600 text-gray-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-600 hover:text-white transition-colors flex items-center gap-1"
          >
            {getIcon('✕')}
            Supprimer le filtre
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredConges.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm flex items-center gap-2">
            {getIcon('📊')}
            Affichage de {indexOfFirstConge + 1} à {Math.min(indexOfLastConge, filteredConges.length)} sur {filteredConges.length} congé(s)
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
              {getIcon('◀')}
              Précédent
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border border-gray-300 rounded text-sm min-w-[40px] ${
                    currentPage === page 
                      ? 'bg-gray-600 text-white' 
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
              Suivant
              {getIcon('▶')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Congés par page:</span>
            <select
              value={congesPerPage}
              onChange={(e) => {
                setCongesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-500"
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              Chargement des congés...
            </div>
          </div>
        ) : filteredConges.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm || activeTab !== 'tous' 
              ? `Aucun congé trouvé ${activeTab !== 'tous' ? `pour les ${activeTab === 'en-attente' ? 'congés en attente' : activeTab === 'approuves' ? 'congés approuvés' : 'congés rejetés'}` : ''}`
              : "Aucun congé enregistré"
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Employé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date début</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date fin</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Motif</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentConges.map((conge, index) => (
                  <tr 
                    key={conge._id}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {conge.user ? `${conge.user.nom} ${conge.user.prenom}` : "-"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>
                          {conge.user?.role}
                          {conge.user?.service?.nomService ? ` • ${conge.user.service.nomService}` : " • Aucun service"}
                        </div>
                        {conge.user?.poste && (
                          <div className="mt-1 flex items-center gap-1">
                            {getIcon('📝')}
                            {conge.user.poste}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeCongeClass(conge.typeConge)}`}>
                        {conge.typeConge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(conge.dateDebut).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(conge.dateFin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      {conge.motif || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatutClass(conge.statut)}`}>
                        {conge.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {/* Actions pour ADMIN_RH - seulement pour les congés en attente */}
                        {userRole === "ADMIN_RH" && conge.statut === "En Attente" && (
                          <>
                            <button
                              onClick={() => updateStatut(conge._id, "Approuvé")}
                              className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                            >
                              {getIcon('✅')}
                              Approuver
                            </button>
                            <button
                              onClick={() => updateStatut(conge._id, "Rejeté")}
                              className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                            >
                              {getIcon('❌')}
                              Rejeter
                            </button>
                          </>
                        )}
                        {/* Aucun bouton de suppression affiché */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}