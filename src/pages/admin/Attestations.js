import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Attestations() {
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('tous');
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [attestationsPerPage] = useState(10);

  const [form, setForm] = useState({
    typeAttestation: "Travail",
    contenu: ""
  });

  // Fonction pour générer les icônes Tailwind
  const getIcon = (iconName, isLarge = false) => {
    const iconClass = `w-5 h-5 ${isLarge ? 'w-6 h-6' : ''}`;
    
    switch(iconName) {
      case '📄': // Attestations
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
      case '✅': // Approuver
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '📥': // Télécharger
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case '🗑️': // Supprimer
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case '📊': // Statistiques
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case '⏳': // En attente
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '❌': // Rejeté
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  // Filtrer les attestations par statut et recherche
  const getFilteredAttestations = () => {
    let filtered = attestations.filter(attestation =>
      attestation.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attestation.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attestation.typeAttestation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attestation.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attestation.contenu?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab !== 'tous') {
      filtered = filtered.filter(attestation => {
        switch (activeTab) {
          case 'en-attente':
            return attestation.statut === "En Attente";
          case 'approuvees':
            return attestation.statut === "Approuvé";
          case 'rejetees':
            return attestation.statut === "Rejeté";
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredAttestations = getFilteredAttestations();
  const indexOfLastAttestation = currentPage * attestationsPerPage;
  const indexOfFirstAttestation = indexOfLastAttestation - attestationsPerPage;
  const currentAttestations = filteredAttestations.slice(indexOfFirstAttestation, indexOfLastAttestation);
  const totalPages = Math.ceil(filteredAttestations.length / attestationsPerPage);

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
    setShowModal(false);
  };

  // Ouvrir le modal pour ajouter
  const handleAddAttestation = () => {
    resetForm();
    setShowModal(true);
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

  // Télécharger une attestation en PDF
  const telechargerAttestationPDF = async (id) => {
    try {
      const response = await api.get(`/pdf/attestations/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      // Fallback sur le téléchargement texte si le PDF n'est pas disponible
      telechargerAttestationTexte(id);
    }
  };

  // Télécharger une attestation en texte (fallback)
  const telechargerAttestationTexte = async (id) => {
    try {
      const response = await api.get(`/attestations/download/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation_${id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erreur téléchargement texte:", error);
      alert("Erreur lors du téléchargement de l'attestation");
    }
  };

  // Supprimer une attestation
  const handleDelete = async (attestation) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la demande d'attestation de ${attestation.user?.nom} ${attestation.user?.prenom} ?`)) {
      return;
    }

    try {
      await api.delete(`/attestations/${attestation._id}`);
      alert("Demande d'attestation supprimée avec succès");
      fetchAttestations();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression de la demande");
    }
  };

  // Fonction pour obtenir la classe du statut
  const getStatutClass = (statut) => {
    switch (statut) {
      case "Approuvé":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Rejeté":
        return "bg-red-100 text-red-800 border border-red-200";
      case "En Attente":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Fonction pour obtenir la classe du type d'attestation
  const getTypeAttestationClass = (typeAttestation) => {
    switch (typeAttestation) {
      case "Travail":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Salaire":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Stage":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Autre":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Obtenir les statistiques
  const getStats = () => {
    const total = attestations.length;
    const enAttente = attestations.filter(a => a.statut === "En Attente").length;
    const approuvees = attestations.filter(a => a.statut === "Approuvé").length;
    const rejetees = attestations.filter(a => a.statut === "Rejeté").length;

    return { total, enAttente, approuvees, rejetees };
  };

  const stats = getStats();

  // Fonction pour déterminer les colonnes à afficher
  const getTableHeaders = () => {
    return [
      { key: 'demandeur', label: 'Demandeur' },
      { key: 'type', label: 'Type' },
      { key: 'contenu', label: 'Contenu' },
      { key: 'statut', label: 'Statut' },
      { key: 'date', label: 'Date demande' },
      { key: 'actions', label: 'Actions' }
    ];
  };

  // Fonction pour afficher le contenu des cellules
  const renderCellContent = (attestation, columnKey) => {
    switch (columnKey) {
      case 'demandeur':
        return (
          <div>
            <div className="font-medium text-gray-900">
              {attestation.user ? `${attestation.user.nom} ${attestation.user.prenom}` : "-"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <div>
                {attestation.user?.role}
                {attestation.user?.service?.nomService && ` • ${attestation.user.service.nomService}`}
              </div>
              {attestation.user?.poste && (
                <div className="mt-1 flex items-center gap-1">
                  {getIcon('📝')}
                  {attestation.user.poste}
                </div>
              )}
            </div>
          </div>
        );

      case 'type':
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeAttestationClass(attestation.typeAttestation)}`}>
            {attestation.typeAttestation}
          </span>
        );

      case 'contenu':
        return (
          <div className="max-w-[200px] text-gray-600">
            <div className="line-clamp-2">
              {attestation.contenu || "Aucun contenu spécifique"}
            </div>
          </div>
        );

      case 'statut':
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatutClass(attestation.statut)}`}>
            {attestation.statut}
          </span>
        );

      case 'date':
        return (
          <div className="text-sm text-gray-600">
            {new Date(attestation.createdAt).toLocaleDateString('fr-FR')}
          </div>
        );

      case 'actions':
        return (
          <div className="flex gap-2 justify-center">
            {/* Actions pour ADMIN_RH */}
            {userRole === "ADMIN_RH" && attestation.statut === "En Attente" && (
              <button
                onClick={() => genererAttestation(attestation._id)}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-green-300"
              >
                {getIcon('✅')}
                Approuver
              </button>
            )}
            
            {/* Télécharger pour les attestations approuvées */}
            {attestation.statut === "Approuvé" && (
              <button
                onClick={() => telechargerAttestationPDF(attestation._id)}
                className="bg-green-200 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-green-300"
              >
                {getIcon('📥')}
                PDF
              </button>
            )}

            {/* Bouton supprimer */}
            {(userRole === "ADMIN_RH" || (userRole === "SALARIE" && attestation.statut === "En Attente")) && (
              <button
                onClick={() => handleDelete(attestation)}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-red-300"
              >
                {getIcon('🗑️')}
                Supprimer
              </button>
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
          {getIcon('📄', true)}
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Attestations</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par demandeur, type, statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {getIcon('🔍')}
            </div>
          </div>

          {/* Bouton Demander une attestation (seulement pour les salariés/stagiaires) */}
          {(userRole === "SALARIE" || userRole === "STAGIAIRE") && (
            <button
              onClick={handleAddAttestation}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              {getIcon('➕')}
              Nouvelle demande
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            Approuvées
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.approuvees}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('❌')}
            Rejetées
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.rejetees}</div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'tous', label: 'Toutes les attestations', count: stats.total, icon: '📊' },
            { key: 'en-attente', label: 'En attente', count: stats.enAttente, icon: '⏳' },
            { key: 'approuvees', label: 'Approuvées', count: stats.approuvees, icon: '✅' },
            { key: 'rejetees', label: 'Rejetées', count: stats.rejetees, icon: '❌' }
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
                activeTab === 'en-attente' ? 'En attente' :
                activeTab === 'approuvees' ? 'Approuvées' : 'Rejetées'
              }
            </strong>
            <div className="text-sm text-gray-600 mt-1">
              Affichage de {filteredAttestations.length} attestation(s) sur {attestations.length} au total
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

      {/* Modal de demande d'attestation */}
      {showModal && (userRole === "SALARIE" || userRole === "STAGIAIRE") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* En-tête du modal */}
            <div className="bg-gray-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {getIcon('➕')}
                  Nouvelle demande d'attestation
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
                    Type d'attestation *
                  </label>
                  <select
                    name="typeAttestation"
                    value={form.typeAttestation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu
                  </label>
                  <textarea
                    name="contenu"
                    value={form.contenu}
                    onChange={handleInputChange}
                    placeholder="Décrivez le contenu spécifique de votre attestation..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  />
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
                    Soumettre la demande
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredAttestations.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm flex items-center gap-2">
            {getIcon('📊')}
            Affichage de {indexOfFirstAttestation + 1} à {Math.min(indexOfLastAttestation, filteredAttestations.length)} sur {filteredAttestations.length} attestation(s)
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
            <span className="text-sm text-gray-600">Attestations par page:</span>
            <select
              value={attestationsPerPage}
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

      {/* Tableau des attestations */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredAttestations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm || activeTab !== 'tous' 
              ? `Aucune attestation trouvée ${activeTab !== 'tous' ? `pour les ${activeTab === 'en-attente' ? 'attestations en attente' : activeTab === 'approuvees' ? 'attestations approuvées' : 'attestations rejetées'}` : ''}`
              : "Aucune attestation enregistrée"
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
                {currentAttestations.map((attestation, index) => (
                  <tr 
                    key={attestation._id}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    {getTableHeaders().map(header => (
                      <td 
                        key={header.key}
                        className="px-4 py-3 text-sm border-t border-gray-200"
                      >
                        {renderCellContent(attestation, header.key)}
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