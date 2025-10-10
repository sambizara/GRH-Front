import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function StagesAdmin() {
  const [stages, setStages] = useState([]);
  const [encadreurs, setEncadreurs] = useState([]);
  const [stagesSansEncadreur, setStagesSansEncadreur] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationForm, setNotificationForm] = useState({ show: false, userId: "", message: "" });
  const [assignForm, setAssignForm] = useState({ show: false, stageId: "", encadreurId: "" });

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [stagesPerPage, setStagesPerPage] = useState(10);

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

  // Fonction pour obtenir le style du statut
  const getStatutStyle = (statut) => {
    switch (statut) {
      case "En attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Confirmé":
        return "bg-green-100 text-green-800 border-green-200";
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Terminé":
        return "bg-green-100 text-green-800 border-green-200";
      case "Annulé":
        return "bg-red-100 text-red-800 border-red-200";
      case "Rejeté":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Fonction pour obtenir le style de confirmation
  const getConfirmationStyle = (confirmationStatut) => {
    switch (confirmationStatut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmé':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeté':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Filtrage et pagination
  const filteredStages = (activeTab === "sans-encadreur" ? stagesSansEncadreur : stages).filter(stage =>
    stage.stagiaire?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.stagiaire?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.encadreur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.encadreur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.sujet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.statut?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStage = currentPage * stagesPerPage;
  const indexOfFirstStage = indexOfLastStage - stagesPerPage;
  const currentStages = filteredStages.slice(indexOfFirstStage, indexOfLastStage);
  const totalPages = Math.ceil(filteredStages.length / stagesPerPage);

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

  // Statistiques
  const stats = {
    total: stages.length,
    enAttente: stages.filter(s => s.statut === "En attente").length,
    confirmes: stages.filter(s => s.statut === "Confirmé").length,
    enCours: stages.filter(s => s.statut === "En cours").length,
    termines: stages.filter(s => s.statut === "Terminé").length,
    sansEncadreur: stagesSansEncadreur.length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête avec onglets */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎓 Gestion des Stages (Admin)</h1>
          <p className="text-gray-600 mt-1">Gérez tous les stages et assignations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>

          {/* Bouton Assigner encadreur */}
          <button
            onClick={() => setAssignForm({ show: true, stageId: "", encadreurId: "" })}
            disabled={stagesSansEncadreur.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              stagesSansEncadreur.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            👥 Assigner encadreur
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
          <div className="text-sm text-yellow-600">En attente</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.enAttente}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <div className="text-sm text-green-600">Confirmés</div>
          <div className="text-2xl font-bold text-green-700">{stats.confirmes}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
          <div className="text-sm text-blue-600">En cours</div>
          <div className="text-2xl font-bold text-blue-700">{stats.enCours}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <div className="text-sm text-green-600">Terminés</div>
          <div className="text-2xl font-bold text-green-700">{stats.termines}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
          <div className="text-sm text-red-600">Sans encadreur</div>
          <div className="text-2xl font-bold text-red-700">{stats.sansEncadreur}</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab("tous"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "tous" 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
          }`}
        >
          Tous les stages ({stages.length})
        </button>
        <button
          onClick={() => { setActiveTab("sans-encadreur"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "sans-encadreur" 
              ? 'bg-red-600 text-white' 
              : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'
          }`}
        >
          Stages sans encadreur ({stagesSansEncadreur.length})
        </button>
      </div>

      {/* Formulaire d'assignation d'encadreur */}
      {assignForm.show && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">👥</span>
            Assigner un encadreur
          </h3>
          
          <form onSubmit={handleAssignEncadreur} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage *</label>
              <select
                value={assignForm.stageId}
                onChange={(e) => setAssignForm(prev => ({ ...prev, stageId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un stage</option>
                {stagesSansEncadreur.map(stage => (
                  <option key={stage._id} value={stage._id}>
                    {stage.stagiaire.nom} {stage.stagiaire.prenom} - {stage.sujet}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Encadreur *</label>
              <select
                value={assignForm.encadreurId}
                onChange={(e) => setAssignForm(prev => ({ ...prev, encadreurId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un encadreur</option>
                {encadreurs.map(encadreur => (
                  <option key={encadreur._id} value={encadreur._id}>
                    {encadreur.nom} {encadreur.prenom} - {encadreur.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setAssignForm({ show: false, stageId: "", encadreurId: "" })}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Assigner
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pagination */}
      {filteredStages.length > 0 && (
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            Affichage de {indexOfFirstStage + 1} à {Math.min(indexOfLastStage, filteredStages.length)} sur {filteredStages.length} stage(s)
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded text-sm ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
              }`}
            >
              ◀ Précédent
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded text-sm min-w-[40px] ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded text-sm ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
              }`}
            >
              Suivant ▶
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Stages par page:</span>
            <select
              value={stagesPerPage}
              onChange={(e) => {
                setStagesPerPage(Number(e.target.value));
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

      {/* Tableau des stages */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des stages...</p>
          </div>
        ) : filteredStages.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">😔</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {searchTerm ? "Aucun stage trouvé" : "Aucun stage enregistré"}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? "Essayez de modifier vos critères de recherche" : "Commencez par créer un nouveau stage"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-4 text-left text-sm font-semibold">Stagiaire</th>
                  <th className="p-4 text-left text-sm font-semibold">Encadreur</th>
                  <th className="p-4 text-left text-sm font-semibold">Sujet</th>
                  <th className="p-4 text-left text-sm font-semibold">Période</th>
                  <th className="p-4 text-left text-sm font-semibold">Durée restante</th>
                  <th className="p-4 text-left text-sm font-semibold">Statut</th>
                  <th className="p-4 text-left text-sm font-semibold">Confirmation</th>
                  <th className="p-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStages.map((stage, index) => (
                  <tr 
                    key={stage._id}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {stage.stagiaire ? `${stage.stagiaire.nom} ${stage.stagiaire.prenom}` : "-"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {stage.stagiaire?.email}
                      </div>
                      {stage.stagiaire?.poste && (
                        <div className="text-xs text-gray-400 mt-1">
                          {stage.stagiaire.poste}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {stage.encadreur ? (
                        <>
                          <div className="font-medium text-gray-900">
                            {stage.encadreur.nom} {stage.encadreur.prenom}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {stage.encadreur.email}
                          </div>
                        </>
                      ) : (
                        <span className="text-red-600 font-medium italic">
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-medium text-gray-900">
                        {stage.sujet}
                      </div>
                      {stage.theme && (
                        <div className="text-sm text-gray-500 mt-1">
                          Thème: {stage.theme}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900">
                        {new Date(stage.dateDebut).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        au {new Date(stage.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDureeStyle(stage.dateFin)}`}>
                        {calculerDureeRestante(stage.dateFin)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatutStyle(stage.statut)}`}>
                        {stage.statut}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConfirmationStyle(stage.confirmationEncadreur?.statut)}`}>
                        {stage.confirmationEncadreur?.statut === 'en_attente' && '⏳ En attente'}
                        {stage.confirmationEncadreur?.statut === 'confirmé' && '✅ Confirmé'}
                        {stage.confirmationEncadreur?.statut === 'rejeté' && '❌ Rejeté'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {/* Changer statut */}
                        {stage.statut !== "Terminé" && stage.statut !== "Rejeté" && (
                          <button
                            onClick={() => updateStageStatus(stage._id, "Terminé")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            ✅ Terminer
                          </button>
                        )}
                        {stage.statut !== "Annulé" && stage.statut !== "Rejeté" && (
                          <button
                            onClick={() => updateStageStatus(stage._id, "Annulé")}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            ❌ Annuler
                          </button>
                        )}
                        
                        {/* Notifier */}
                        <button
                          onClick={() => setNotificationForm({ 
                            show: true, 
                            userId: stage.stagiaire?._id, 
                            message: `Stage: ${stage.sujet}` 
                          })}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          📧 Notifier
                        </button>
                        
                        {/* Supprimer */}
                        <button
                          onClick={() => handleDelete(stage)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          🗑️ Supprimer
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

      {/* Modal de notification */}
      {notificationForm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📧</span>
                Envoyer une notification
              </h3>
              
              <form onSubmit={sendNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Votre message de notification..."
                    rows="4"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setNotificationForm({ show: false, userId: "", message: "" })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Envoyer
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