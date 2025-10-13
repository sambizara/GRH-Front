import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MonStage() {
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStage();
  }, []);

  const fetchStage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/stages/mon-stage");
      
      if (response.data.success) {
        setStage(response.data.stage);
      } else {
        setError(response.data.message || "Aucun stage trouvé");
      }
    } catch (err) {
      console.error("Erreur chargement stage:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement du stage");
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = () => {
    if (!stage?.dateFin) return null;
    const end = new Date(stage.dateFin);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusStyle = (statut) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre stage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucun stage trouvé</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchStage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">🎓</span>
                Mon Stage
              </h1>
              <p className="text-gray-600">{stage.sujet}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className={`px-4 py-2 rounded-full border ${getStatusStyle(stage.statut)}`}>
                <span className="font-semibold">{stage.statut}</span>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getConfirmationStyle(stage.confirmationEncadreur?.statut)}`}>
                <span className="font-semibold">
                  {stage.confirmationEncadreur?.statut === 'en_attente' && '⏳ En attente'}
                  {stage.confirmationEncadreur?.statut === 'confirmé' && '✅ Confirmé'}
                  {stage.confirmationEncadreur?.statut === 'rejeté' && '❌ Rejeté'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Informations encadrement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">👨‍🏫</span>
              Mon Encadreur
            </h3>
            {stage.encadreur ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Nom complet</label>
                  <p className="font-medium text-gray-800">{stage.encadreur.prenom} {stage.encadreur.nom}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  <p className="font-medium text-gray-800">{stage.encadreur.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Téléphone</label>
                  <p className="font-medium text-gray-800">{stage.encadreur.telephone || "Non renseigné"}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Matricule</label>
                  <p className="font-medium text-gray-800">{stage.encadreur.matricule}</p>
                </div>
                <div className="pt-4 border-t">
                  <a 
                    href={`mailto:${stage.encadreur.email}`}
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <span className="mr-2">✉️</span>
                    Contacter mon encadreur
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">😔</div>
                <p className="text-gray-500">Aucun encadreur assigné pour le moment</p>
              </div>
            )}
          </div>

          {/* Thème et Objectifs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Détails du Stage
            </h3>
            <div className="space-y-6">
              {stage.theme && (
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Thème principal</label>
                  <p className="font-medium text-gray-800 text-lg">{stage.theme}</p>
                </div>
              )}
              
              {stage.objectifs && stage.objectifs.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Objectifs</label>
                  <ul className="space-y-2">
                    {stage.objectifs.map((objectif, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{objectif}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {stage.competencesRequises && stage.competencesRequises.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Compétences visées</label>
                  <div className="flex flex-wrap gap-2">
                    {stage.competencesRequises.map((competence, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {competence}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {stage.confirmationEncadreur?.commentaires && (
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Commentaires de l'encadreur</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {stage.confirmationEncadreur.commentaires}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Période et durée */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Période du stage */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📅</span>
              Période du Stage
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Date de début</span>
                <span className="font-semibold text-gray-800">
                  {new Date(stage.dateDebut).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Date de fin</span>
                <span className="font-semibold text-gray-800">
                  {new Date(stage.dateFin).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Durée totale</span>
                  <span className="font-semibold text-gray-800">
                    {Math.ceil((new Date(stage.dateFin) - new Date(stage.dateDebut)) / (1000 * 60 * 60 * 24))} jours
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Durée restante */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">⏱️</span>
              Temps Restant
            </h3>
            <div className="text-center py-4">
              <div className={`text-3xl font-bold mb-2 ${
                daysRemaining() <= 0 ? 'text-red-600' :
                daysRemaining() <= 7 ? 'text-red-600' : 
                daysRemaining() <= 30 ? 'text-orange-500' : 'text-green-600'
              }`}>
                {daysRemaining() > 0 ? `${daysRemaining()} jours` : "Stage terminé"}
              </div>
              <p className="text-gray-600">
                {daysRemaining() > 0 ? 
                  `Se termine le ${new Date(stage.dateFin).toLocaleDateString('fr-FR')}` :
                  `Terminé depuis ${Math.abs(daysRemaining())} jours`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-4">
            {stage.encadreur && (
              <a 
                href={`mailto:${stage.encadreur.email}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">✉️</span>
                Contacter mon encadreur
              </a>
            )}
            
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center">
              <span className="mr-2">📤</span>
              Déposer un rapport
            </button>
            
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors duration-200 flex items-center">
              <span className="mr-2">📋</span>
              Carnet de bord
            </button>

            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center">
              <span className="mr-2">📊</span>
              Évaluations
            </button>
          </div>
        </div>

        {/* Informations de confirmation */}
        {stage.confirmationEncadreur?.dateConfirmation && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              Détails de la Confirmation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date de confirmation</label>
                <p className="font-medium text-gray-800">
                  {new Date(stage.confirmationEncadreur.dateConfirmation).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Statut de confirmation</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfirmationStyle(stage.confirmationEncadreur.statut)}`}>
                  {stage.confirmationEncadreur.statut === 'en_attente' && '⏳ En attente'}
                  {stage.confirmationEncadreur.statut === 'confirmé' && '✅ Confirmé'}
                  {stage.confirmationEncadreur.statut === 'rejeté' && '❌ Rejeté'}
                </span>
              </div>
              {stage.confirmationEncadreur.motifRejet && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-500 mb-1">Motif du rejet</label>
                  <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                    {stage.confirmationEncadreur.motifRejet}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}