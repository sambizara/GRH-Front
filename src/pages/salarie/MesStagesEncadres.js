import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MesStagesEncadres() {
  const [stagesEnAttente, setStagesEnAttente] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [mesStagiaires, setMesStagiaires] = useState([]);
  const [activeTab, setActiveTab] = useState('en_attente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ show: false, type: '', stage: null });

  const [confirmationForm, setConfirmationForm] = useState({
    theme: '',
    competencesRequises: '',
    objectifs: '',
    commentaires: ''
  });

  const [rejetForm, setRejetForm] = useState({
    motifRejet: '',
    commentaires: ''
  });

  // Fonction pour générer les icônes Tailwind
  const getIcon = (iconName, isLarge = false) => {
    const iconClass = `w-5 h-5 ${isLarge ? 'w-6 h-6' : ''}`;
    
    switch(iconName) {
      case '👥': // Stagiaires
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case '⏳': // En attente
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '✅': // Confirmé
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '❌': // Rejeté
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '📊': // Historique
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case '🎓': // École
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case '📅': // Date
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

  useEffect(() => {
    if (activeTab === 'en_attente') {
      fetchStagesEnAttente();
    } else if (activeTab === 'historique') {
      fetchHistorique();
    } else if (activeTab === 'mes-stagiaires') {
      fetchMesStagiaires();
    }
  }, [activeTab]);

  const fetchStagesEnAttente = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/demandeStage/stagiaires-en-attente");
      console.log("📦 Réponse stagiaires en attente:", response.data);
      
      if (response.data.success) {
        setStagesEnAttente(response.data.stages || []);
      } else {
        setError(response.data.message || "Erreur inconnue");
      }
    } catch (err) {
      console.error("❌ Erreur fetchStagesEnAttente:", err);
      setError(err.response?.data?.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/demandeStage/historique");
      console.log("📦 Réponse historique:", response.data);
      
      if (response.data.success) {
        setHistorique(response.data.stages || []);
      } else {
        setError(response.data.message || "Erreur inconnue");
      }
    } catch (err) {
      console.error("❌ Erreur fetchHistorique:", err);
      setError(err.response?.data?.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const fetchMesStagiaires = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/demandeStage/mes-stagiaires");
      console.log("📦 Réponse mes stagiaires:", response.data);
      
      if (response.data.success) {
        setMesStagiaires(response.data.stages || []);
      } else {
        setError(response.data.message || "Erreur inconnue");
      }
    } catch (err) {
      console.error("❌ Erreur fetchMesStagiaires:", err);
      setError(err.response?.data?.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmer = async (e) => {
    e.preventDefault();
    try {
      console.log("📤 Données de confirmation:");
      console.log("- Stage ID:", modal.stage._id);
      console.log("- Thème:", confirmationForm.theme);
      console.log("- Compétences:", confirmationForm.competencesRequises);
      console.log("- Objectifs:", confirmationForm.objectifs);
      console.log("- Commentaires:", confirmationForm.commentaires);

      const errors = [];
      if (!confirmationForm.theme?.trim()) {
        errors.push("Le thème du stage est obligatoire");
      }
      if (!confirmationForm.objectifs?.trim()) {
        errors.push("Les objectifs du stage sont obligatoires");
      }
      
      if (errors.length > 0) {
        alert("Veuillez corriger les erreurs suivantes:\n" + errors.join("\n"));
        return;
      }

      const requestData = {
        theme: confirmationForm.theme.trim(),
        competencesRequises: confirmationForm.competencesRequises?.trim() || "Compétences à développer durant le stage",
        objectifs: confirmationForm.objectifs
          .split('\n')
          .map(obj => obj.trim())
          .filter(obj => obj.length > 0),
        commentaires: confirmationForm.commentaires?.trim() || "Confirmation du stage par l'encadreur"
      };

      if (requestData.objectifs.length === 0) {
        alert("Veuillez saisir au moins un objectif pour le stage");
        return;
      }

      console.log("🎯 Envoi confirmation:", {
        stageId: modal.stage._id,
        data: requestData
      });

      const response = await api.post(`/demandeStage/${modal.stage._id}/confirmer`, requestData);
      
      console.log("✅ Réponse confirmation:", response.data);
      
      if (response.data.success) {
        alert("✅ Stagiaire confirmé avec succès !");
        setModal({ show: false, type: '', stage: null });
        setConfirmationForm({ theme: '', competencesRequises: '', objectifs: '', commentaires: '' });
        
        await fetchStagesEnAttente();
        await fetchMesStagiaires();
      } else {
        alert("❌ " + (response.data.message || "Erreur lors de la confirmation"));
      }
    } catch (error) {
      console.error("💥 Erreur complète:", error);
      
      let errorMessage = "Erreur inconnue";
      
      if (error.response?.data) {
        console.error("📋 Réponse erreur backend:", error.response.data);
        errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      } else if (error.request) {
        errorMessage = "Impossible de contacter le serveur";
      } else {
        errorMessage = error.message;
      }
      
      alert(`❌ Erreur de confirmation:\n${errorMessage}`);
    }
  };

  const handleRejeter = async (e) => {
    e.preventDefault();
    try {
      console.log("📤 Rejet stage:", modal.stage._id, rejetForm);
      
      if (!rejetForm.motifRejet) {
        alert("Veuillez sélectionner un motif de rejet");
        return;
      }

      const response = await api.post(`/demandeStage/${modal.stage._id}/rejeter`, rejetForm);
      
      console.log("✅ Réponse rejet:", response.data);
      
      if (response.data.success) {
        alert("Stagiaire rejeté avec succès");
        setModal({ show: false, type: '', stage: null });
        setRejetForm({ motifRejet: '', commentaires: '' });
        fetchStagesEnAttente();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("❌ Erreur rejet:", error);
      alert(error.response?.data?.message || "Erreur lors du rejet");
    }
  };

  const openModal = (type, stage) => {
    console.log("🔓 Ouverture modal:", type, stage);
    setModal({ show: true, type, stage });
    
    if (type === 'confirmer') {
      setConfirmationForm({
        theme: stage.sujet || `Stage en ${stage.stagiaire?.poste || 'développement'}`,
        competencesRequises: '',
        objectifs: `Acquérir des compétences en ${stage.stagiaire?.poste || 'développement'}
Mettre en pratique les connaissances théoriques
Participer aux projets d'équipe
Développer une expérience professionnelle`,
        commentaires: ''
      });
    } else if (type === 'rejeter') {
      setRejetForm({
        motifRejet: '',
        commentaires: ''
      });
    }
  };

  const getStatutClass = (statut) => {
    switch(statut) {
      case 'en_attente':
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'confirmé':
      case 'Confirmé':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejeté':
      case 'Rejeté':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const retryLoad = () => {
    setError(null);
    if (activeTab === 'en_attente') fetchStagesEnAttente();
    else if (activeTab === 'historique') fetchHistorique();
    else if (activeTab === 'mes-stagiaires') fetchMesStagiaires();
  };

  const renderStagiaireInfo = (stage) => {
    if (!stage.stagiaire) return <div>Information stagiaire non disponible</div>;
    
    return (
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          {getIcon('🎓')}
          <span><strong>École:</strong> {stage.stagiaire.ecole || 'Non spécifié'}</span>
        </div>
        <div><strong>Filière:</strong> {stage.stagiaire.filiere || 'Non spécifié'}</div>
        <div><strong>Niveau:</strong> {stage.stagiaire.niveau || 'Non spécifié'}</div>
        <div><strong>Durée:</strong> {stage.stagiaire.dureeStage || 'Non spécifié'} mois</div>
        <div><strong>Email:</strong> {stage.stagiaire.email}</div>
        {stage.stagiaire.telephone && <div><strong>Tél:</strong> {stage.stagiaire.telephone}</div>}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête principal */}
        <div className="flex items-center gap-3 mb-6">
          {getIcon('👥', true)}
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Stagiaires</h1>
        </div>

        {/* Affichage de l'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700 text-center flex items-center justify-center gap-3">
              <span>{error}</span>
              <button
                onClick={retryLoad}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Onglets de navigation */}
        <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {[
              { key: 'en_attente', label: 'En attente', count: stagesEnAttente.length, icon: '⏳' },
              { key: 'mes-stagiaires', label: 'Mes stagiaires', count: mesStagiaires.length, icon: '✅' },
              { key: 'historique', label: 'Historique', count: historique.length, icon: '📊' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[200px] px-4 py-3 rounded-md transition-all ${
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

        {/* Contenu des onglets */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : activeTab === 'en_attente' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stagesEnAttente.map((stage) => (
              <div key={stage._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {stage.stagiaire?.prenom} {stage.stagiaire?.nom}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutClass(stage.statut)}`}>
                    {stage.statut}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="font-medium text-gray-700 mb-2">Sujet du stage:</div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                    {stage.sujet || 'Non spécifié'}
                  </div>
                </div>

                {renderStagiaireInfo(stage)}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openModal('confirmer', stage)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {getIcon('✅')}
                    Confirmer
                  </button>
                  <button
                    onClick={() => openModal('rejeter', stage)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {getIcon('❌')}
                    Rejeter
                  </button>
                </div>
              </div>
            ))}

            {stagesEnAttente.length === 0 && (
              <div className="col-span-3 bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun stage en attente</h3>
                <p className="text-gray-600">Tous les stages ont été traités.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'mes-stagiaires' ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {mesStagiaires.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-600 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Stagiaire</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">École</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Filière</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Niveau</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Durée</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date confirmation</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Sujet du stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesStagiaires.map((stage, index) => (
                      <tr key={stage._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {stage.stagiaire?.prenom} {stage.stagiaire?.nom}
                          </div>
                          <div className="text-sm text-gray-500">{stage.stagiaire?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{stage.stagiaire?.ecole}</td>
                        <td className="px-4 py-3 text-gray-600">{stage.stagiaire?.filiere}</td>
                        <td className="px-4 py-3 text-gray-600">{stage.stagiaire?.niveau}</td>
                        <td className="px-4 py-3 text-gray-600">{stage.stagiaire?.dureeStage} mois</td>
                        <td className="px-4 py-3 text-gray-600">
                          {stage.dateConfirmation 
                            ? new Date(stage.dateConfirmation).toLocaleDateString('fr-FR')
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                            {stage.sujet}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="text-lg font-semibold mb-1">Aucun stagiaire encadré</h3>
                <p>Vous n'avez pas encore confirmé de stagiaire.</p>
              </div>
            )}
          </div>
        ) : (
          // TAB HISTORIQUE
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {historique.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-600 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Stagiaire</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Sujet</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date décision</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Motif rejet</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Commentaires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historique.map((stage, index) => (
                      <tr key={stage._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {stage.stagiaire?.prenom} {stage.stagiaire?.nom}
                          </div>
                          <div className="text-sm text-gray-500">{stage.stagiaire?.ecole}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{stage.sujet}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatutClass(stage.confirmationEncadreur?.statut || stage.statut)}`}>
                            {stage.confirmationEncadreur?.statut || stage.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {stage.confirmationEncadreur?.dateConfirmation 
                            ? new Date(stage.confirmationEncadreur.dateConfirmation).toLocaleDateString('fr-FR')
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {stage.confirmationEncadreur?.motifRejet || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {stage.confirmationEncadreur?.commentaires || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="text-lg font-semibold mb-1">Aucun historique</h3>
                <p>Aucune décision de confirmation/rejet pour le moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal de confirmation */}
        {modal.show && modal.type === 'confirmer' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gray-600 text-white px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {getIcon('✅')}
                    Confirmer le stagiaire
                  </h2>
                  <button
                    onClick={() => setModal({ show: false, type: '', stage: null })}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    {getIcon('✕')}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {modal.stage && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Stagiaire:</h4>
                    <div className="text-sm text-blue-700">
                      <div><strong>Nom:</strong> {modal.stage.stagiaire?.prenom} {modal.stage.stagiaire?.nom}</div>
                      <div><strong>École:</strong> {modal.stage.stagiaire?.ecole}</div>
                      <div><strong>Filière:</strong> {modal.stage.stagiaire?.filiere}</div>
                      <div><strong>Niveau:</strong> {modal.stage.stagiaire?.niveau}</div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleConfirmer} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thème du stage *
                    </label>
                    <input
                      type="text"
                      value={confirmationForm.theme}
                      onChange={(e) => setConfirmationForm(prev => ({ ...prev, theme: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Développement d'une application web..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compétences requises
                    </label>
                    <input
                      type="text"
                      value={confirmationForm.competencesRequises}
                      onChange={(e) => setConfirmationForm(prev => ({ ...prev, competencesRequises: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: JavaScript, React, Node.js..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Séparez les compétences par des virgules
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objectifs du stage *
                    </label>
                    <textarea
                      value={confirmationForm.objectifs}
                      onChange={(e) => setConfirmationForm(prev => ({ ...prev, objectifs: e.target.value }))}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Maîtriser les concepts de développement frontend...
Apprendre les bonnes pratiques de développement...
Participer à des projets réels..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Un objectif par ligne. Au moins un objectif est requis.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaires (optionnel)
                    </label>
                    <textarea
                      value={confirmationForm.commentaires}
                      onChange={(e) => setConfirmationForm(prev => ({ ...prev, commentaires: e.target.value }))}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Commentaires supplémentaires pour le stagiaire..."
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setModal({ show: false, type: '', stage: null })}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                    >
                      Confirmer le stagiaire
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de rejet */}
        {modal.show && modal.type === 'rejeter' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="bg-gray-600 text-white px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {getIcon('❌')}
                    Rejeter le stagiaire
                  </h2>
                  <button
                    onClick={() => setModal({ show: false, type: '', stage: null })}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    {getIcon('✕')}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {modal.stage && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm text-red-700">
                      <div><strong>Stagiaire:</strong> {modal.stage.stagiaire?.prenom} {modal.stage.stagiaire?.nom}</div>
                      <div><strong>École:</strong> {modal.stage.stagiaire?.ecole}</div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleRejeter} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif du rejet *
                    </label>
                    <select
                      value={rejetForm.motifRejet}
                      onChange={(e) => setRejetForm(prev => ({ ...prev, motifRejet: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Sélectionner un motif</option>
                      <option value="compétences_insuffisantes">Compétences insuffisantes</option>
                      <option value="profil_non_adapté">Profil non adapté au poste</option>
                      <option value="charge_travail">Charge de travail trop importante</option>
                      <option value="autres_projets">Priorité à d'autres projets</option>
                      <option value="budget">Problème de budget</option>
                      <option value="autre">Autre motif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaires (optionnel)
                    </label>
                    <textarea
                      value={rejetForm.commentaires}
                      onChange={(e) => setRejetForm(prev => ({ ...prev, commentaires: e.target.value }))}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Explications supplémentaires pour le stagiaire..."
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setModal({ show: false, type: '', stage: null })}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                      Rejeter le stagiaire
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}