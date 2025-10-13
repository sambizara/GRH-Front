// src/pages/salarie/MesStagesEncadres.js
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

  useEffect(() => {
    if (activeTab === 'en_attente') {
      fetchStagesEnAttente();
    } else if (activeTab === 'historique') {
      fetchHistorique();
    } else if (activeTab === 'mes-stagiaires') {
      fetchMesStagiaires();
    }
  }, [activeTab]);

  // 🔹 Récupérer les stages en attente de confirmation
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

  // 🔹 Récupérer l'historique des confirmations/rejets
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

  // 🔹 Récupérer mes stagiaires confirmés
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

  // 🔹 Confirmer un stagiaire - VERSION CORRIGÉE
  const handleConfirmer = async (e) => {
    e.preventDefault();
    try {
      console.log("📤 Données de confirmation:");
      console.log("- Stage ID:", modal.stage._id);
      console.log("- Thème:", confirmationForm.theme);
      console.log("- Compétences:", confirmationForm.competencesRequises);
      console.log("- Objectifs:", confirmationForm.objectifs);
      console.log("- Commentaires:", confirmationForm.commentaires);

      // Validation des données
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

      // Préparer les données avec validation
      const requestData = {
        theme: confirmationForm.theme.trim(),
        competencesRequises: confirmationForm.competencesRequises?.trim() || "Compétences à développer durant le stage",
        objectifs: confirmationForm.objectifs
          .split('\n')
          .map(obj => obj.trim())
          .filter(obj => obj.length > 0),
        commentaires: confirmationForm.commentaires?.trim() || "Confirmation du stage par l'encadreur"
      };

      // Vérifier qu'il y a au moins un objectif
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
        
        // Recharger les données
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

  // 🔹 Rejeter un stagiaire
  const handleRejeter = async (e) => {
    e.preventDefault();
    try {
      console.log("📤 Rejet stage:", modal.stage._id, rejetForm);
      
      // Validation
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

  const getStatutBadge = (statut) => {
    const styles = {
      'en_attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmé': 'bg-green-100 text-green-800 border-green-200',
      'rejeté': 'bg-red-100 text-red-800 border-red-200',
      'En attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Confirmé': 'bg-green-100 text-green-800 border-green-200',
      'Rejeté': 'bg-red-100 text-red-800 border-red-200'
    };
    return `px-3 py-1 rounded-full text-sm font-medium border ${styles[statut] || 'bg-gray-100 text-gray-800'}`;
  };

  const retryLoad = () => {
    setError(null);
    if (activeTab === 'en_attente') fetchStagesEnAttente();
    else if (activeTab === 'historique') fetchHistorique();
    else if (activeTab === 'mes-stagiaires') fetchMesStagiaires();
  };

  // 🔹 Fonction pour afficher les informations du stagiaire
  const renderStagiaireInfo = (stage) => {
    if (!stage.stagiaire) return <div>Information stagiaire non disponible</div>;
    
    return (
      <div className="space-y-2 text-sm text-gray-600">
        <div><strong>École:</strong> {stage.stagiaire.ecole || 'Non spécifié'}</div>
        <div><strong>Filière:</strong> {stage.stagiaire.filiere || 'Non spécifié'}</div>
        <div><strong>Niveau:</strong> {stage.stagiaire.niveau || 'Non spécifié'}</div>
        <div><strong>Poste:</strong> {stage.stagiaire.poste || 'Non spécifié'}</div>
        <div><strong>Durée:</strong> {stage.stagiaire.dureeStage || 'Non spécifié'} mois</div>
        <div><strong>Email:</strong> {stage.stagiaire.email}</div>
        {stage.stagiaire.telephone && <div><strong>Tél:</strong> {stage.stagiaire.telephone}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 Gestion des Stagiaires</h1>

      {/* Affichage de l'erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-center">
            {error}
            <button
              onClick={retryLoad}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab('en_attente')}
            className={`flex-1 px-4 py-3 rounded-md transition-all ${
              activeTab === 'en_attente' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            } font-medium flex items-center justify-center`}
          >
            En attente
            <span className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
              {stagesEnAttente.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('mes-stagiaires')}
            className={`flex-1 px-4 py-3 rounded-md transition-all ${
              activeTab === 'mes-stagiaires' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            } font-medium flex items-center justify-center`}
          >
            Mes stagiaires
            <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
              {mesStagiaires.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`flex-1 px-4 py-3 rounded-md transition-all ${
              activeTab === 'historique' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            } font-medium flex items-center justify-center`}
          >
            Historique
            <span className="ml-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
              {historique.length}
            </span>
          </button>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : activeTab === 'en_attente' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stagesEnAttente.map((stage) => (
            <div key={stage._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {stage.stagiaire?.prenom} {stage.stagiaire?.nom}
                </h3>
                <span className={getStatutBadge(stage.statut)}>
                  {stage.statut}
                </span>
              </div>

              {/* Informations du stage */}
              <div className="mb-4">
                <div className="font-medium text-gray-700 mb-2">Sujet du stage:</div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {stage.sujet || 'Non spécifié'}
                </div>
              </div>

              {/* Informations du stagiaire */}
              {renderStagiaireInfo(stage)}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openModal('confirmer', stage)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  ✅ Confirmer
                </button>
                <button
                  onClick={() => openModal('rejeter', stage)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  ❌ Rejeter
                </button>
              </div>
            </div>
          ))}

          {stagesEnAttente.length === 0 && (
            <div className="col-span-3 text-center py-10">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun stage en attente</h3>
              <p className="text-gray-600">Tous les stages ont été traités.</p>
            </div>
          )}
        </div>
      ) : activeTab === 'mes-stagiaires' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {mesStagiaires.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 text-left">Stagiaire</th>
                  <th className="p-3 text-left">École</th>
                  <th className="p-3 text-left">Filière</th>
                  <th className="p-3 text-left">Niveau</th>
                  <th className="p-3 text-left">Poste</th>
                  <th className="p-3 text-left">Durée</th>
                  <th className="p-3 text-left">Date confirmation</th>
                  <th className="p-3 text-left">Sujet du stage</th>
                </tr>
              </thead>
              <tbody>
                {mesStagiaires.map((stage, index) => (
                  <tr key={stage._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3">
                      <div className="font-medium text-gray-800">
                        {stage.stagiaire?.prenom} {stage.stagiaire?.nom}
                      </div>
                      <div className="text-sm text-gray-500">{stage.stagiaire?.email}</div>
                    </td>
                    <td className="p-3 text-gray-600">{stage.stagiaire?.ecole}</td>
                    <td className="p-3 text-gray-600">{stage.stagiaire?.filiere}</td>
                    <td className="p-3 text-gray-600">{stage.stagiaire?.niveau}</td>
                    <td className="p-3 text-gray-600">{stage.stagiaire?.poste}</td>
                    <td className="p-3 text-gray-600">{stage.stagiaire?.dureeStage} mois</td>
                    <td className="p-3 text-gray-600">
                      {stage.dateConfirmation 
                        ? new Date(stage.dateConfirmation).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </td>
                    <td className="p-3 text-gray-600">
                      <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                        {stage.sujet}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {historique.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 text-left">Stagiaire</th>
                  <th className="p-3 text-left">Sujet</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Date décision</th>
                  <th className="p-3 text-left">Motif rejet</th>
                  <th className="p-3 text-left">Commentaires</th>
                </tr>
              </thead>
              <tbody>
                {historique.map((stage, index) => (
                  <tr key={stage._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3">
                      <div className="font-medium text-gray-800">
                        {stage.stagiaire?.prenom} {stage.stagiaire?.nom}
                      </div>
                      <div className="text-sm text-gray-500">{stage.stagiaire?.ecole}</div>
                    </td>
                    <td className="p-3 text-gray-600">{stage.sujet}</td>
                    <td className="p-3">
                      <span className={getStatutBadge(stage.confirmationEncadreur?.statut || stage.statut)}>
                        {stage.confirmationEncadreur?.statut || stage.statut}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {stage.confirmationEncadreur?.dateConfirmation 
                        ? new Date(stage.confirmationEncadreur.dateConfirmation).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </td>
                    <td className="p-3 text-gray-600">
                      {stage.confirmationEncadreur?.motifRejet || '-'}
                    </td>
                    <td className="p-3 text-gray-600">
                      {stage.confirmationEncadreur?.commentaires || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                ✅ Confirmer le stagiaire
              </h3>
              
              {/* Informations du stagiaire */}
              {modal.stage && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Stagiaire:</h4>
                  <div className="text-sm text-blue-700">
                    <div><strong>Nom:</strong> {modal.stage.stagiaire?.prenom} {modal.stage.stagiaire?.nom}</div>
                    <div><strong>École:</strong> {modal.stage.stagiaire?.ecole}</div>
                    <div><strong>Filière:</strong> {modal.stage.stagiaire?.filiere}</div>
                    <div><strong>Niveau:</strong> {modal.stage.stagiaire?.niveau}</div>
                    <div><strong>Poste demandé:</strong> {modal.stage.stagiaire?.poste}</div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleConfirmer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thème du stage *
                  </label>
                  <input
                    type="text"
                    value={confirmationForm.theme}
                    onChange={(e) => setConfirmationForm(prev => ({ ...prev, theme: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Développement d'une application web..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compétences requises
                  </label>
                  <input
                    type="text"
                    value={confirmationForm.competencesRequises}
                    onChange={(e) => setConfirmationForm(prev => ({ ...prev, competencesRequises: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: JavaScript, React, Node.js..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Séparez les compétences par des virgules
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectifs du stage *
                  </label>
                  <textarea
                    value={confirmationForm.objectifs}
                    onChange={(e) => setConfirmationForm(prev => ({ ...prev, objectifs: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaires (optionnel)
                  </label>
                  <textarea
                    value={confirmationForm.commentaires}
                    onChange={(e) => setConfirmationForm(prev => ({ ...prev, commentaires: e.target.value }))}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Commentaires supplémentaires pour le stagiaire..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setModal({ show: false, type: '', stage: null })}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                ❌ Rejeter le stagiaire
              </h3>
              
              {/* Informations du stagiaire */}
              {modal.stage && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-red-700">
                    <div><strong>Stagiaire:</strong> {modal.stage.stagiaire?.prenom} {modal.stage.stagiaire?.nom}</div>
                    <div><strong>École:</strong> {modal.stage.stagiaire?.ecole}</div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleRejeter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motif du rejet *
                  </label>
                  <select
                    value={rejetForm.motifRejet}
                    onChange={(e) => setRejetForm(prev => ({ ...prev, motifRejet: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaires (optionnel)
                  </label>
                  <textarea
                    value={rejetForm.commentaires}
                    onChange={(e) => setRejetForm(prev => ({ ...prev, commentaires: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Explications supplémentaires pour le stagiaire..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setModal({ show: false, type: '', stage: null })}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
  );
}