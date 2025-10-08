import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Attestations() {
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [attestationsPerPage, setAttestationsPerPage] = useState(10);

  const [form, setForm] = useState({
    typeAttestation: "Travail",
    contenu: ""
  });

  // Calculs pour la pagination
  const indexOfLastAttestation = currentPage * attestationsPerPage;
  const indexOfFirstAttestation = indexOfLastAttestation - attestationsPerPage;
  const filteredAttestations = attestations.filter(attestation =>
    attestation.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attestation.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attestation.typeAttestation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attestation.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attestation.contenu?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentAttestations = filteredAttestations.slice(indexOfFirstAttestation, indexOfLastAttestation);
  const totalPages = Math.ceil(filteredAttestations.length / attestationsPerPage);

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
    setCurrentPage(1);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête avec bouton d'ajout et recherche */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📄 Gestion des Attestations</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Barre de recherche */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Rechercher une attestation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Bouton Demander une attestation (seulement pour les salariés/stagiaires) */}
          {(userRole === "SALARIE" || userRole === "STAGIAIRE") && (
            <button
              onClick={handleAddAttestation}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span>➕</span>
              Nouvelle demande
            </button>
          )}
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (userRole === "SALARIE" || userRole === "STAGIAIRE") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  📝 Nouvelle demande d'attestation
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'attestation *
                  </label>
                  <select
                    name="typeAttestation"
                    value={form.typeAttestation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-vertical"
                  />
                </div>

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
                    className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
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
          <div className="text-gray-600 text-sm">
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
              ◀ Précédent
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border border-gray-300 rounded text-sm min-w-[40px] ${
                    currentPage === page 
                      ? 'bg-gray-800 text-white' 
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
              Suivant ▶
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Attestations par page:</span>
            <select
              value={attestationsPerPage}
              onChange={(e) => {
                setAttestationsPerPage(Number(e.target.value));
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

      {/* Tableau des attestations */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              Chargement des attestations...
            </div>
          </div>
        ) : filteredAttestations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "Aucune attestation trouvée" : "Aucune attestation enregistrée"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Demandeur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Contenu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date demande</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAttestations.map((attestation, index) => (
                  <tr 
                    key={attestation._id}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {attestation.user ? `${attestation.user.nom} ${attestation.user.prenom}` : "-"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>
                          {attestation.user?.role}
                          {attestation.user?.service?.nomService && ` • ${attestation.user.service.nomService}`}
                        </div>
                        {attestation.user?.poste && (
                          <div className="mt-1">
                            📝 {attestation.user.poste}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeAttestationClass(attestation.typeAttestation)}`}>
                        {attestation.typeAttestation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <div className="line-clamp-2">
                        {attestation.contenu || "Aucun contenu spécifique"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatutClass(attestation.statut)}`}>
                        {attestation.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(attestation.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {/* Actions pour ADMIN_RH */}
                        {userRole === "ADMIN_RH" && attestation.statut === "En Attente" && (
                          <button
                            onClick={() => genererAttestation(attestation._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <span>✅</span>
                            Approuver
                          </button>
                        )}
                        
                        {/* Télécharger pour les attestations approuvées */}
                        {attestation.statut === "Approuvé" && (
                          <button
                            onClick={() => telechargerAttestationPDF(attestation._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <span>📄</span>
                            PDF
                          </button>
                        )}

                        {/* Bouton supprimer */}
                        {(userRole === "ADMIN_RH" || (userRole === "SALARIE" && attestation.statut === "En Attente")) && (
                          <button
                            onClick={() => handleDelete(attestation)}
                            className="bg-gray-200 hover:bg-red-100 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <span>🗑️</span>
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Total demandes</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-2xl font-bold text-gray-800">{stats.enAttente}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Approuvées</div>
          <div className="text-2xl font-bold text-gray-800">{stats.approuvees}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Rejetées</div>
          <div className="text-2xl font-bold text-gray-800">{stats.rejetees}</div>
        </div>
      </div>
    </div>
  );
}