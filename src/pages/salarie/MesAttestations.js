import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axiosConfig";

export default function MesAttestations() {
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [attestationsPerPage] = useState(10);
  
  const [form, setForm] = useState({
    typeAttestation: "",
    contenu: ""
  });
  
  const [preview, setPreview] = useState(null);

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
      case '👁️': // Prévisualiser
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case '📨': // Envoyer
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
      default:
        return <span className={iconClass}>•</span>;
    }
  };

  // Récupérer les attestations du salarié
  const fetchAttestations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/attestations/mes-attestations");
      setAttestations(response.data.attestations || []);
      console.log("📊 Mes attestations chargées:", response.data.attestations?.length || 0);
      
    } catch (err) {
      console.error("❌ Erreur chargement attestations:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement de vos attestations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchAttestations();
  }, [fetchAttestations]);

  // Prévisualiser l'attestation
  const handlePreview = async () => {
    if (!form.typeAttestation) {
      alert("Veuillez sélectionner un type d'attestation");
      return;
    }

    try {
      const response = await api.post("/attestations/salarie/preview", {
        typeAttestation: form.typeAttestation
      });
      setPreview(response.data);
    } catch (error) {
      console.error("Erreur prévisualisation:", error);
      alert("Erreur lors de la prévisualisation");
    }
  };

  // Soumettre la demande
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.typeAttestation) {
      alert("Veuillez sélectionner un type d'attestation");
      return;
    }

    try {
      await api.post("/attestations/salarie/demande", form);
      alert("✅ Demande d'attestation envoyée avec succès");
      setForm({ typeAttestation: "", contenu: "" });
      setPreview(null);
      fetchAttestations();
    } catch (err) {
      console.error("❌ Erreur demande attestation:", err);
      alert(err.response?.data?.message || "Erreur lors de la demande d'attestation");
    }
  };

  const getStatutClass = (statut) => {
    switch(statut) {
      case 'Approuvé': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Rejeté': return 'bg-red-100 text-red-800 border border-red-200';
      case 'En Attente': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getTypeClass = (type) => {
    switch(type) {
      case 'Travail': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Salaire': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Autre': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Pagination
  const indexOfLastAttestation = currentPage * attestationsPerPage;
  const indexOfFirstAttestation = indexOfLastAttestation - attestationsPerPage;
  const currentAttestations = attestations.slice(indexOfFirstAttestation, indexOfLastAttestation);
  const totalPages = Math.ceil(attestations.length / attestationsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchAttestations();
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              {getIcon('🔄')}
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête principal */}
        <div className="flex items-center gap-3 mb-6">
          {getIcon('📄', true)}
          <h1 className="text-2xl font-bold text-gray-800">Mes Attestations</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Demandez et suivez vos attestations de travail
        </p>

        {/* Formulaire de demande */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {getIcon('➕')}
            Nouvelle demande d'attestation
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'attestation *
                </label>
                <select 
                  name="typeAttestation"
                  value={form.typeAttestation}
                  onChange={(e) => setForm({...form, typeAttestation: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Choisir un type</option>
                  <option value="Travail">Attestation de Travail</option>
                  <option value="Salaire">Attestation de Salaire</option>
                  <option value="Autre">Autre type</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!form.typeAttestation}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2"
                >
                  {getIcon('👁️')}
                  Prévisualiser
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu personnalisé (optionnel)
              </label>
              <textarea
                name="contenu"
                value={form.contenu}
                onChange={(e) => setForm({...form, contenu: e.target.value})}
                placeholder="Décrivez le contenu spécifique que vous souhaitez dans votre attestation..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              />
            </div>

            {/* Prévisualisation */}
            {preview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  {getIcon('👁️')}
                  Aperçu de l'attestation
                </h4>
                <div className="bg-white p-4 rounded border border-gray-300 text-sm font-mono whitespace-pre-wrap">
                  {preview.contenu}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors font-medium flex items-center gap-2"
              >
                {getIcon('📨')}
                Envoyer la demande
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setForm({ typeAttestation: "", contenu: "" });
                  setPreview(null);
                }}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-red-300"
              >
                {getIcon('🔄')}
                Annuler
              </button>
            </div>
          </form>
        </div>

        {/* Liste des attestations */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {getIcon('📜')}
              Mes demandes d'attestation
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de vos attestations...</p>
            </div>
          ) : attestations.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lg">Aucune demande d'attestation pour le moment</p>
            </div>
          ) : (
            <>
              {/* Pagination */}
              {attestations.length > 0 && (
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-gray-600 text-sm flex items-center gap-2">
                    {getIcon('📊')}
                    Affichage de {indexOfFirstAttestation + 1} à {Math.min(indexOfLastAttestation, attestations.length)} sur {attestations.length} attestation(s)
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
                </div>
              )}

              {/* Tableau des attestations */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-600 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date demande</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Contenu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAttestations.map((attestation, index) => (
                      <tr 
                        key={attestation._id}
                        className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeClass(attestation.typeAttestation)}`}>
                            {attestation.typeAttestation}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600">
                            {new Date(attestation.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatutClass(attestation.statut)}`}>
                            {attestation.statut}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-600 max-w-xs">
                          {attestation.contenu || (
                            <span className="italic text-gray-400">
                              Aucun contenu personnalisé
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}