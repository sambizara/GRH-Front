import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function StagesAdmin() {
  const [stages, setStages] = useState([]);
  const [encadreurs, setEncadreurs] = useState([]);
  const [stagesSansEncadreur, setStagesSansEncadreur] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [stagesPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [notificationForm, setNotificationForm] = useState({ show: false, userId: "", message: "" });
  const [assignForm, setAssignForm] = useState({ show: false, stageId: "", encadreurId: "" });

  // Fonction pour générer les icônes Tailwind
  const getIcon = (iconName, isLarge = false) => {
    const iconClass = `w-5 h-5 ${isLarge ? 'w-6 h-6' : ''}`;
    
    switch(iconName) {
      case '🎓': // Stages
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case '🔍': // Recherche
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case '👥': // Assigner
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case '✅': // Confirmer
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
      case '📧': // Notifier
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

  // Charger les données
  useEffect(() => {
    fetchStages();
    fetchUsers();
    fetchStagesSansEncadreur();
  }, []);

  const fetchStages = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stages");
      setStages(response.data.stages || response.data);
    } catch (error) {
      console.error("Erreur chargement stages:", error);
      alert("Erreur lors du chargement des stages");
    } finally {
      setLoading(false);
    }
  };

  const fetchStagesSansEncadreur = async () => {
    try {
      const response = await api.get("/stages/sans-encadreur");
      setStagesSansEncadreur(response.data.stages || response.data);
    } catch (error) {
      console.error("Erreur chargement stages sans encadreur:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      const encadreursList = response.data.filter(user => 
        user.role === "SALARIE" && user.actif !== false
      );
      setEncadreurs(encadreursList);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  // Assigner un encadreur à un stage
  const handleAssignEncadreur = async (e) => {
    e.preventDefault();
    
    if (!assignForm.stageId || !assignForm.encadreurId) {
      alert("Veuillez sélectionner un stage et un encadreur");
      return;
    }

    try {
      await api.post("/stages/assigner-encadreur", {
        stageId: assignForm.stageId,
        encadreurId: assignForm.encadreurId
      });
      
      alert("Encadreur assigné avec succès");
      setAssignForm({ show: false, stageId: "", encadreurId: "" });
      fetchStages();
      fetchStagesSansEncadreur();
    } catch (error) {
      console.error("Erreur assignation:", error);
      alert(error.response?.data?.message || "Erreur lors de l'assignation");
    }
  };

  // Mettre à jour le statut d'un stage
  const updateStageStatus = async (id, statut) => {
    try {
      await api.patch(`/stages/${id}/statut`, { statut });
      alert(`Statut du stage mis à jour: ${statut}`);
      fetchStages();
      fetchStagesSansEncadreur();
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // Supprimer un stage
  const handleDelete = async (stage) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le stage "${stage.sujet}" ?`)) {
      return;
    }

    try {
      await api.delete(`/stages/${stage._id}`);
      alert("Stage supprimé avec succès");
      fetchStages();
      fetchStagesSansEncadreur();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Envoyer une notification
  const sendNotification = async (e) => {
    e.preventDefault();
    
    if (!notificationForm.userId || !notificationForm.message) {
      alert("Veuillez remplir tous les champs de la notification");
      return;
    }

    try {
      await api.post("/stages/notifier", {
        userId: notificationForm.userId,
        type: "Stage",
        message: notificationForm.message
      });
      alert("Notification envoyée avec succès");
      setNotificationForm({ show: false, userId: "", message: "" });
    } catch (error) {
      console.error("Erreur notification:", error);
      alert("Erreur lors de l'envoi de la notification");
    }
  };

  // Fonction pour obtenir le style de confirmation
  const getConfirmationStyle = (confirmationStatut) => {
    switch (confirmationStatut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'confirmé':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejeté':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Calculer la durée restante
  const calculerDureeRestante = (dateFin) => {
    const maintenant = new Date();
    const fin = new Date(dateFin);
    const diffTime = fin - maintenant;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Terminé";
    if (diffDays === 0) return "Dernier jour";
    return `${diffDays} jour(s)`;
  };

  // Obtenir le style de la durée
  const getDureeStyle = (dateFin) => {
    const maintenant = new Date();
    const fin = new Date(dateFin);
    const diffTime = fin - maintenant;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "bg-gray-500 text-white";
    if (diffDays <= 7) return "bg-red-500 text-white";
    if (diffDays <= 30) return "bg-orange-500 text-white";
    return "bg-green-500 text-white";
  };

  // Filtrage par onglet
  const getFilteredStages = () => {
    let filtered = stages;
    
    // Filtre par recherche
    filtered = filtered.filter(stage =>
      stage.stagiaire?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.stagiaire?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.encadreur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.encadreur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.sujet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.confirmationEncadreur?.statut?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtre par onglet actif
    switch (activeTab) {
      case "sans-encadreur":
        return stagesSansEncadreur.filter(stage =>
          stage.stagiaire?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stage.stagiaire?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stage.sujet?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "en-attente":
        return filtered.filter(stage => 
          stage.confirmationEncadreur?.statut === 'en_attente'
        );
      case "confirmes":
        return filtered.filter(stage => 
          stage.confirmationEncadreur?.statut === 'confirmé'
        );
      case "rejetes":
        return filtered.filter(stage => 
          stage.confirmationEncadreur?.statut === 'rejeté'
        );
      default:
        return filtered;
    }
  };

  const filteredStages = getFilteredStages();
  const indexOfLastStage = currentPage * stagesPerPage;
  const indexOfFirstStage = indexOfLastStage - stagesPerPage;
  const currentStages = filteredStages.slice(indexOfFirstStage, indexOfLastStage);
  const totalPages = Math.ceil(filteredStages.length / stagesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Navigation pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fonction pour déterminer les colonnes à afficher
  const getTableHeaders = () => {
    const baseHeaders = [
      { key: 'stagiaire', label: 'Stagiaire' },
      { key: 'encadreur', label: 'Encadreur' },
      { key: 'sujet', label: 'Sujet' }
    ];

    if (activeTab === 'tous') {
      return [
        ...baseHeaders,
        { key: 'periode', label: 'Période' },
        { key: 'duree', label: 'Durée restante' },
        { key: 'confirmation', label: 'Confirmation' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    if (activeTab === 'sans-encadreur') {
      return [
        ...baseHeaders,
        { key: 'periode', label: 'Période' },
        { key: 'duree', label: 'Durée restante' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    return [
      ...baseHeaders,
      { key: 'periode', label: 'Période' },
      { key: 'duree', label: 'Durée restante' },
      { key: 'confirmation', label: 'Confirmation' },
      { key: 'actions', label: 'Actions' }
    ];
  };

  // Fonction pour afficher le contenu des cellules
  const renderCellContent = (stage, columnKey) => {
    switch (columnKey) {
      case 'stagiaire':
        return (
          <div className="font-medium text-gray-900">
            {stage.stagiaire ? `${stage.stagiaire.nom} ${stage.stagiaire.prenom}` : "-"}
          </div>
        );

      case 'encadreur':
        return stage.encadreur ? (
          <div className="font-medium text-gray-900">
            {stage.encadreur.nom} {stage.encadreur.prenom}
          </div>
        ) : (
          <span className="text-red-600 font-medium italic">Non assigné</span>
        );

      case 'sujet':
        return (
          <div className="max-w-xs">
            <div className="font-medium text-gray-900">
              {stage.sujet}
            </div>
            {stage.theme && (
              <div className="text-sm text-gray-500 mt-1">
                Thème: {stage.theme}
              </div>
            )}
          </div>
        );

      case 'periode':
        return (
          <div>
            <div className="text-gray-900">
              {new Date(stage.dateDebut).toLocaleDateString('fr-FR')}
            </div>
            <div className="text-sm text-gray-500">
              au {new Date(stage.dateFin).toLocaleDateString('fr-FR')}
            </div>
          </div>
        );

      case 'duree':
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDureeStyle(stage.dateFin)}`}>
            {calculerDureeRestante(stage.dateFin)}
          </span>
        );

      case 'confirmation':
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConfirmationStyle(stage.confirmationEncadreur?.statut)}`}>
            {stage.confirmationEncadreur?.statut === 'en_attente' && (
              <span className="flex items-center gap-1">
                {getIcon('⏳')}
                En attente
              </span>
            )}
            {stage.confirmationEncadreur?.statut === 'confirmé' && (
              <span className="flex items-center gap-1">
                {getIcon('✅')}
                Confirmé
              </span>
            )}
            {stage.confirmationEncadreur?.statut === 'rejeté' && (
              <span className="flex items-center gap-1">
                {getIcon('❌')}
                Rejeté
              </span>
            )}
          </span>
        );

      case 'actions':
        return (
          <div className="flex gap-2 justify-center">
            {/* Changer statut */}
            {stage.confirmationEncadreur?.statut === 'en_attente' && (
              <>
                <button
                  onClick={() => updateStageStatus(stage._id, "Confirmé")}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-green-300"
                >
                  {getIcon('✅')}
                  Confirmer
                </button>
                <button
                  onClick={() => updateStageStatus(stage._id, "Rejeté")}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-red-300"
                >
                  {getIcon('❌')}
                  Rejeter
                </button>
              </>
            )}
            
            {/* Notifier */}
            <button
              onClick={() => setNotificationForm({ 
                show: true, 
                userId: stage.stagiaire?._id, 
                message: `Stage: ${stage.sujet}` 
              })}
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-orange-300"
            >
              {getIcon('📧')}
              Notifier
            </button>
            
            {/* Supprimer */}
            <button
              onClick={() => handleDelete(stage)}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-red-300"
            >
              {getIcon('🗑️')}
              Supprimer
            </button>
          </div>
        );

      default:
        return "-";
    }
  };

  // Statistiques
  const stats = {
    total: stages.length,
    enAttente: stages.filter(s => s.confirmationEncadreur?.statut === 'en_attente').length,
    confirmes: stages.filter(s => s.confirmationEncadreur?.statut === 'confirmé').length,
    rejetes: stages.filter(s => s.confirmationEncadreur?.statut === 'rejeté').length,
    sansEncadreur: stagesSansEncadreur.length
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

      {/* En-tête avec bouton d'assignation et recherche */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          {getIcon('🎓', true)}
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Stages</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par stagiaire, encadreur, sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {getIcon('🔍')}
            </div>
          </div>

          {/* Bouton Assigner encadreur */}
          <button
            onClick={() => setAssignForm({ show: true, stageId: "", encadreurId: "" })}
            disabled={stagesSansEncadreur.length === 0}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm ${
              stagesSansEncadreur.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {getIcon('👥')}
            Assigner encadreur
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('📊')}
            Total stages
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
            Confirmés
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.confirmes}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('❌')}
            Rejetés
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.rejetes}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {getIcon('👥')}
            Sans encadreur
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.sansEncadreur}</div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'tous', label: 'Tous les stages', count: stats.total, icon: '📊' },
            { key: 'en-attente', label: 'En attente', count: stats.enAttente, icon: '⏳' },
            { key: 'confirmes', label: 'Confirmés', count: stats.confirmes, icon: '✅' },
            { key: 'rejetes', label: 'Rejetés', count: stats.rejetes, icon: '❌' },
            { key: 'sans-encadreur', label: 'Sans encadreur', count: stats.sansEncadreur, icon: '👥' }
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
                activeTab === 'confirmes' ? 'Confirmés' :
                activeTab === 'rejetes' ? 'Rejetés' : 'Sans encadreur'
              }
            </strong>
            <div className="text-sm text-gray-600 mt-1">
              Affichage de {filteredStages.length} stage(s) sur {stages.length} au total
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

      {/* Modal d'assignation d'encadreur */}
      {assignForm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* En-tête du modal */}
            <div className="bg-gray-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {getIcon('👥')}
                  Assigner un encadreur
                </h2>
                <button
                  onClick={() => setAssignForm({ show: false, stageId: "", encadreurId: "" })}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  {getIcon('✕')}
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleAssignEncadreur} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stage *</label>
                    <select
                      value={assignForm.stageId}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, stageId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Sélectionner un stage</option>
                      {stagesSansEncadreur.map(stage => (
                        <option key={stage._id} value={stage._id}>
                          {stage.stagiaire.nom} {stage.stagiaire.prenom} - {stage.sujet}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {stagesSansEncadreur.length} stage(s) disponible(s) sans encadreur
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Encadreur *</label>
                    <select
                      value={assignForm.encadreurId}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, encadreurId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Sélectionner un encadreur</option>
                      {encadreurs.map(encadreur => (
                        <option key={encadreur._id} value={encadreur._id}>
                          {encadreur.nom} {encadreur.prenom} - {encadreur.role}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {encadreurs.length} encadreur(s) disponible(s)
                    </p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setAssignForm({ show: false, stageId: "", encadreurId: "" })}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                  >
                    Assigner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notification */}
      {notificationForm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-gray-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {getIcon('📧')}
                  Envoyer une notification
                </h2>
                <button
                  onClick={() => setNotificationForm({ show: false, userId: "", message: "" })}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  {getIcon('✕')}
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={sendNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Votre message de notification..."
                    rows="4"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setNotificationForm({ show: false, userId: "", message: "" })}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredStages.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm flex items-center gap-2">
            {getIcon('📊')}
            Affichage de {indexOfFirstStage + 1} à {Math.min(indexOfLastStage, filteredStages.length)} sur {filteredStages.length} stage(s)
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
            <span className="text-sm text-gray-600">Stages par page:</span>
            <select
              value={stagesPerPage}
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

      {/* Tableau des stages */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredStages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm || activeTab !== 'tous' 
              ? `Aucun stage trouvé ${activeTab !== 'tous' ? `pour les ${activeTab === 'en-attente' ? 'stages en attente' : activeTab === 'confirmes' ? 'stages confirmés' : activeTab === 'rejetes' ? 'stages rejetés' : 'stages sans encadreur'}` : ''}`
              : "Aucun stage enregistré"
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
                {currentStages.map((stage, index) => (
                  <tr 
                    key={stage._id}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    {getTableHeaders().map(header => (
                      <td 
                        key={header.key}
                        className="px-4 py-3 text-sm border-t border-gray-200"
                      >
                        {renderCellContent(stage, header.key)}
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