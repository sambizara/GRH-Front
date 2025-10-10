// src/pages/salarie/GestionStagiaires.js
import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function GestionStagiaires() {
  const [stagesProposes, setStagesProposes] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [activeTab, setActiveTab] = useState('proposes');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: '', stage: null });

  const [confirmationForm, setConfirmationForm] = useState({
    theme: '',
    competencesRequises: [],
    objectifs: [],
    commentaires: ''
  });

  const [rejetForm, setRejetForm] = useState({
    motifRejet: '',
    commentaires: ''
  });

  useEffect(() => {
    if (activeTab === 'proposes') {
      fetchStagesProposes();
    } else {
      fetchHistorique();
    }
  }, [activeTab]);

  const fetchStagesProposes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stages/mes-stages-proposes");
      setStagesProposes(response.data.stages || []);
    } catch (error) {
      console.error("Erreur chargement stages proposés:", error);
      alert("Erreur lors du chargement des stages proposés");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stages/mes-stages-encadres");
      setHistorique(response.data.stages || []);
    } catch (error) {
      console.error("Erreur chargement historique:", error);
      alert("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmer = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/stages/${modal.stage._id}/confirmer-propose`, confirmationForm);
      alert("Stage confirmé avec succès !");
      setModal({ show: false, type: '', stage: null });
      setConfirmationForm({ theme: '', competencesRequises: [], objectifs: [], commentaires: '' });
      fetchStagesProposes();
    } catch (error) {
      console.error("Erreur confirmation:", error);
      alert(error.response?.data?.message || "Erreur lors de la confirmation");
    }
  };

  const handleRejeter = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/stages/${modal.stage._id}/rejeter-propose`, rejetForm);
      alert("Stage rejeté avec succès");
      setModal({ show: false, type: '', stage: null });
      setRejetForm({ motifRejet: '', commentaires: '' });
      fetchStagesProposes();
    } catch (error) {
      console.error("Erreur rejet:", error);
      alert(error.response?.data?.message || "Erreur lors du rejet");
    }
  };

  const openModal = (type, stage) => {
    setModal({ show: true, type, stage });
    if (type === 'confirmer') {
      setConfirmationForm({
        theme: stage.sujet,
        competencesRequises: [],
        objectifs: [],
        commentaires: ''
      });
    }
  };

  const getStatutBadge = (statut) => {
    const styles = {
      'Proposé': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Confirmé': 'bg-green-100 text-green-800 border-green-200',
      'Rejeté': 'bg-red-100 text-red-800 border-red-200',
      'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
      'Terminé': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return `px-3 py-1 rounded-full text-sm font-medium border ${styles[statut]}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 Gestion des Stagiaires</h1>

      {/* Onglets */}
      <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab('proposes')}
            className={`flex-1 px-4 py-3 rounded-md transition-all ${
              activeTab === 'proposes' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            } font-medium`}
          >
            Stages Proposés
            <span className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
              {stagesProposes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`flex-1 px-4 py-3 rounded-md transition-all ${
              activeTab === 'historique' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            } font-medium`}
          >
            Mes Stages Encadrés
          </button>
        </div>
      </div>

      {/* Contenu - Stages Proposés */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : activeTab === 'proposes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stagesProposes.map((stage) => (
            <div key={stage._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">
                  {stage.stagiaire.prenom} {stage.stagiaire.nom}
                </h3>
                <span className={getStatutBadge('Proposé')}>
                  Proposé
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>Poste:</strong> {stage.stagiaire.poste}
                </div>
                <div>
                  <strong>École:</strong> {stage.stagiaire.ecole}
                </div>
                <div>
                  <strong>Filière:</strong> {stage.stagiaire.filiere} - {stage.stagiaire.niveau}
                </div>
                <div>
                  <strong>Durée:</strong> {stage.stagiaire.dureeStage} mois
                </div>
                <div>
                  <strong>Sujet proposé:</strong> {stage.sujet}
                </div>
                <div>
                  <strong>Période:</strong> {new Date(stage.dateDebut).toLocaleDateString('fr-FR')} - {new Date(stage.dateFin).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <strong>Contact:</strong> {stage.stagiaire.email}
                </div>
                {stage.stagiaire.telephone && (
                  <div>
                    <strong>Téléphone:</strong> {stage.stagiaire.telephone}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openModal('confirmer', stage)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  ✅ Confirmer
                </button>
                <button
                  onClick={() => openModal('rejeter', stage)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  ❌ Rejeter
                </button>
              </div>
            </div>
          ))}

          {stagesProposes.length === 0 && (
            <div className="col-span-3 text-center py-10">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Aucun stage proposé
              </h3>
              <p className="text-gray-600">
                Aucun stagiaire ne correspond actuellement à votre poste.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Historique - Garder votre code existant */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 text-left">Stagiaire</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-left">Date décision</th>
                <th className="p-3 text-left">Thème/Sujet</th>
                <th className="p-3 text-left">Motif rejet</th>
              </tr>
            </thead>
            <tbody>
              {historique.map((stage, index) => (
                <tr key={stage._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3">
                    {stage.stagiaire.prenom} {stage.stagiaire.nom}
                    <div className="text-sm text-gray-500">{stage.stagiaire.ecole}</div>
                  </td>
                  <td className="p-3">
                    <span className={getStatutBadge(stage.statut)}>
                      {stage.statut}
                    </span>
                  </td>
                  <td className="p-3">
                    {stage.confirmationEncadreur?.dateConfirmation 
                      ? new Date(stage.confirmationEncadreur.dateConfirmation).toLocaleDateString('fr-FR')
                      : '-'
                    }
                  </td>
                  <td className="p-3">
                    {stage.theme || stage.sujet}
                  </td>
                  <td className="p-3">
                    {stage.confirmationEncadreur?.motifRejet || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {historique.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Aucun stage encadré pour le moment
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmation */}
      {modal.show && modal.type === 'confirmer' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                ✅ Confirmer le stagiaire
              </h3>
              
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
                    value={confirmationForm.competencesRequises.join(', ')}
                    onChange={(e) => setConfirmationForm(prev => ({ 
                      ...prev, 
                      competencesRequises: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: JavaScript, React, Node.js..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectifs du stage
                  </label>
                  <textarea
                    value={confirmationForm.objectifs.join('\n')}
                    onChange={(e) => setConfirmationForm(prev => ({ 
                      ...prev, 
                      objectifs: e.target.value.split('\n').filter(s => s.trim())
                    }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Maîtriser les concepts de développement frontend..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaires
                  </label>
                  <textarea
                    value={confirmationForm.commentaires}
                    onChange={(e) => setConfirmationForm(prev => ({ ...prev, commentaires: e.target.value }))}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Commentaires supplémentaires..."
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
                    placeholder="Explications supplémentaires..."
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

      {/* Overlay pour les modals */}
      {(modal.show) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}
    </div>
  );
}