import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Rapports() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('tous');
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rapportsPerPage] = useState(10);

  const [form, setForm] = useState({
    titre: "",
    fichier: null
  });

  // Fonction pour générer les icônes Tailwind
  const getIcon = (iconName, isLarge = false) => {
    const iconClass = `w-5 h-5 ${isLarge ? 'w-6 h-6' : ''}`;
    
    switch(iconName) {
      case '📘': // Rapports
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
      case '📥': // Télécharger
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case '✅': // Publier
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '📁': // Archiver
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case '📝': // Brouillon
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
      default:
        return <span className={iconClass}>•</span>;
    }
  };

  // Filtrer les rapports par statut et recherche
  const getFilteredRapports = () => {
    let filtered = rapports.filter(rapport =>
      rapport.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.statut?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab !== 'tous') {
      filtered = filtered.filter(rapport => rapport.statut === activeTab);
    }

    return filtered;
  };

  const filteredRapports = getFilteredRapports();
  const indexOfLastRapport = currentPage * rapportsPerPage;
  const indexOfFirstRapport = indexOfLastRapport - rapportsPerPage;
  const currentRapports = filteredRapports.slice(indexOfFirstRapport, indexOfLastRapport);
  const totalPages = Math.ceil(filteredRapports.length / rapportsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

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
      const endpoint = "/rapports/all";
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
    const { name, value, files } = e.target;
    if (name === "fichier" && files) {
      setForm(prev => ({ ...prev, fichier: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      titre: "",
      fichier: null
    });
    setShowModal(false);
  };

  // Soumettre un rapport (pour les stagiaires)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titre || !form.fichier) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titre', form.titre);
      formData.append('fichier', form.fichier);

      await api.post("/rapports", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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

  // Télécharger via l'API
  const telechargerRapport = async (rapportId) => {
    try {
      const response = await api.get(`/rapports/download/${rapportId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'rapport.pdf';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      alert("Erreur lors du téléchargement du rapport");
    }
  };

  // Fonction pour obtenir la classe du statut
  const getStatutClass = (statut) => {
    switch (statut) {
      case "Publié":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Archivé":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "Brouillon":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Obtenir les statistiques
  const getStats = () => {
    const total = rapports.length;
    const brouillons = rapports.filter(r => r.statut === "Brouillon").length;
    const publies = rapports.filter(r => r.statut === "Publié").length;
    const archives = rapports.filter(r => r.statut === "Archivé").length;

    return { total, brouillons, publies, archives };
  };

  const stats = getStats();

  // Fonction pour déterminer les colonnes à afficher
  const getTableHeaders = () => {
    return [
      { key: 'stagiaire', label: 'Stagiaire' },
      { key: 'titre', label: 'Titre' },
      { key: 'fichier', label: 'Fichier' },
      { key: 'date', label: 'Date dépôt' },
      { key: 'statut', label: 'Statut' },
      { key: 'actions', label: 'Actions' }
    ];
  };

  // Fonction pour afficher le contenu des cellules
  const renderCellContent = (rapport, columnKey) => {
    switch (columnKey) {
      case 'stagiaire':
        return (
          <div>
            <div className="font-medium text-gray-900">
              {rapport.user ? `${rapport.user.nom} ${rapport.user.prenom}` : "-"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <div>
                {rapport.user?.role}
                {rapport.user?.service?.nomService && ` • ${rapport.user.service.nomService}`}
              </div>
              {rapport.user?.poste && (
                <div className="mt-1 flex items-center gap-1">
                  {getIcon('📝')}
                  {rapport.user.poste}
                </div>
              )}
            </div>
          </div>
        );

      case 'titre':
        return (
          <div className="font-medium text-gray-900">
            {rapport.titre}
          </div>
        );

      case 'fichier':
        return rapport.fichier ? (
          <button
            onClick={() => telechargerRapport(rapport._id)}
            className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-green-300"
          >
            {getIcon('📥')}
            Télécharger
          </button>
        ) : (
          <span className="text-gray-400 italic">Aucun fichier</span>
        );

      case 'date':
        return (
          <div className="text-sm text-gray-600">
            {new Date(rapport.dateDepot).toLocaleDateString('fr-FR')}
          </div>
        );

      case 'statut':
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatutClass(rapport.statut)}`}>
            {rapport.statut}
          </span>
        );

      case 'actions':
        return (
          <div className="flex gap-2 justify-center">
            {/* Actions pour ADMIN_RH */}
            {userRole === "ADMIN_RH" && (
              <>
                {rapport.statut !== "Publié" && (
                  <button
                    onClick={() => updateStatut(rapport._id, "Publié")}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-red-300"
                  >
                    {getIcon('✅')}
                    Publier
                  </button>
                )}
                {rapport.statut !== "Archivé" && (
                  <button
                    onClick={() => updateStatut(rapport._id, "Archivé")}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-gray-300"
                  >
                    {getIcon('📁')}
                    Archiver
                  </button>
                )}
                {rapport.statut !== "Brouillon" && (
                  <button
                    onClick={() => updateStatut(rapport._id, "Brouillon")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                  >
                    {getIcon('📝')}
                    Brouillon
                  </button>
                )}
              </>
            )}
          </div>
        );

      default:
        return "-";
    }
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
        <div className="flex items-center gap-3">
          {getIcon('📘', true)}
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Rapports</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par stagiaire, titre, statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {getIcon('🔍')}
            </div>
          </div>

          {/* Bouton Déposer un rapport (seulement pour les stagiaires) */}
          {userRole === "STAGIAIRE" && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              {getIcon('➕')}
              Déposer un rapport
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('📊')}
            Total rapports
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('📝')}
            Brouillons
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.brouillons}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('✅')}
            Publiés
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.publies}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('📁')}
            Archivés
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.archives}</div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'tous', label: 'Tous les rapports', count: stats.total, icon: '📊' },
            { key: 'Brouillon', label: 'Brouillons', count: stats.brouillons, icon: '📝' },
            { key: 'Publié', label: 'Publiés', count: stats.publies, icon: '✅' },
            { key: 'Archivé', label: 'Archivés', count: stats.archives, icon: '📁' }
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
              Filtre actif : {
                activeTab === 'Brouillon' ? 'Brouillons' :
                activeTab === 'Publié' ? 'Publiés' : 'Archivés'
              }
            </strong>
            <div className="text-sm text-gray-600 mt-1">
              Affichage de {filteredRapports.length} rapport(s) sur {rapports.length} au total
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

      {/* Modal de dépôt de rapport */}
      {showModal && userRole === "STAGIAIRE" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* En-tête du modal */}
            <div className="bg-gray-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {getIcon('➕')}
                  Déposer un nouveau rapport
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  {getIcon('✕')}
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du rapport *
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={form.titre}
                    onChange={handleInputChange}
                    placeholder="Titre du rapport..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fichier *
                  </label>
                  <input
                    type="file"
                    name="fichier"
                    onChange={handleInputChange}
                    accept=".pdf,.doc,.docx,.txt"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    {getIcon('📎')}
                    Formats acceptés: PDF, DOC, DOCX, TXT
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
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
                    Déposer le rapport
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredRapports.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm flex items-center gap-2">
            {getIcon('📊')}
            Affichage de {indexOfFirstRapport + 1} à {Math.min(indexOfLastRapport, filteredRapports.length)} sur {filteredRapports.length} rapport(s)
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
            <span className="text-sm text-gray-600">Rapports par page:</span>
            <select
              value={rapportsPerPage}
              onChange={(e) => setCurrentPage(1)}
              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredRapports.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm || activeTab !== 'tous' 
              ? `Aucun rapport trouvé ${activeTab !== 'tous' ? `pour les ${activeTab === 'Brouillon' ? 'rapports brouillons' : activeTab === 'Publié' ? 'rapports publiés' : 'rapports archivés'}` : ''}`
              : "Aucun rapport déposé"
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-600 text-white">
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
                {currentRapports.map((rapport, index) => (
                  <tr 
                    key={rapport._id}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    {getTableHeaders().map(header => (
                      <td 
                        key={header.key}
                        className="px-4 py-3 text-sm border-t border-gray-200"
                      >
                        {renderCellContent(rapport, header.key)}
                      </td>
                    ))}
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