import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Conges() {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = "ADMIN_RH"; // À adapter selon l'utilisateur connecté

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [congesPerPage, setCongesPerPage] = useState(10);

  const [form, setForm] = useState({
    typeConge: "Annuel",
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0],
    motif: ""
  });

  // Calculs pour la pagination
  const indexOfLastConge = currentPage * congesPerPage;
  const indexOfFirstConge = indexOfLastConge - congesPerPage;
  const filteredConges = conges.filter(conge =>
    conge.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.typeConge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.motif?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentConges = filteredConges.slice(indexOfFirstConge, indexOfLastConge);
  const totalPages = Math.ceil(filteredConges.length / congesPerPage);

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
    fetchConges();
  }, []);

  const fetchConges = async () => {
    setLoading(true);
    try {
      let endpoint = "/conges/admin/tous";
      
      console.log("🌐 Chargement des congés admin...");
      const response = await api.get(endpoint);
      
      console.log("✅ Réponse admin:", response.data);
      
      if (response.data.success) {
        setConges(response.data.conges || []);
      } else {
        throw new Error(response.data.message || "Erreur de chargement");
      }
      
    } catch (error) {
      console.error("❌ Erreur chargement congés:", error);
      alert(`Erreur lors du chargement des congés: ${error.response?.data?.message || error.message}`);
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
      typeConge: "Annuel",
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0],
      motif: ""
    });
    setShowModal(false);
    setCurrentPage(1);
  };

  // Ouvrir le modal pour ajouter
  const handleAddConge = () => {
    resetForm();
    setShowModal(true);
  };

  // Soumettre une demande de congé (pour les salariés)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.dateDebut || !form.dateFin) {
      alert("Veuillez remplir les dates de début et de fin");
      return;
    }

    if (new Date(form.dateDebut) > new Date(form.dateFin)) {
      alert("La date de début ne peut pas être après la date de fin");
      return;
    }

    try {
      await api.post("/conges", form);
      alert("Demande de congé créée avec succès");
      resetForm();
      fetchConges();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de la création du congé");
    }
  };

  // Changer le statut (Approuvé / Rejeté) - pour les ADMIN_RH
  const updateStatut = async (id, statut) => {
    try {
      await api.put(`/conges/admin/${id}/statut`, { statut });
      alert(`Congé ${statut.toLowerCase()} avec succès`);
      fetchConges();
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error);
      alert(`Erreur lors de la mise à jour: ${error.response?.data?.message || error.message}`);
    }
  };

  // Supprimer un congé
  const handleDelete = async (conge) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la demande de congé de ${conge.user?.nom} ${conge.user?.prenom} ?`)) {
      return;
    }

    try {
      await api.delete(`/conges/${conge._id}`);
      alert("Congé supprimé avec succès");
      fetchConges();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      alert(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  // Fonction pour obtenir la classe du statut
  const getStatutClass = (statut) => {
    switch (statut) {
      case "Approuvé":
        return "bg-green-500 text-white";
      case "Rejeté":
        return "bg-red-500 text-white";
      case "En Attente":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Fonction pour obtenir la classe du type de congé
  const getTypeCongeClass = (typeConge) => {
    switch (typeConge) {
      case "Annuel":
        return "bg-blue-500 text-white";
      case "Maladie":
        return "bg-red-500 text-white";
      case "Sans Solde":
        return "bg-gray-500 text-white";
      case "Maternité":
        return "bg-purple-500 text-white";
      case "Paternité":
        return "bg-teal-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Obtenir les statistiques
  const getStats = () => {
    const total = conges.length;
    const enAttente = conges.filter(c => c.statut === "En Attente").length;
    const approuves = conges.filter(c => c.statut === "Approuvé").length;
    const rejetes = conges.filter(c => c.statut === "Rejeté").length;

    return { total, enAttente, approuves, rejetes };
  };

  const stats = getStats();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête avec bouton d'ajout et recherche */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📅 Gestion des Congés</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Barre de recherche */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Rechercher un congé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Bouton Demander un congé (seulement pour les salariés) */}
          {userRole === "SALARIE" && (
            <button
              onClick={handleAddConge}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span>➕</span>
              Demander un congé
            </button>
          )}
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && userRole === "SALARIE" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  📝 Nouvelle demande de congé
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
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de congé *</label>
                  <select
                    name="typeConge"
                    value={form.typeConge}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
                  >
                    <option value="Annuel">Annuel</option>
                    <option value="Maladie">Maladie</option>
                    <option value="Sans Solde">Sans solde</option>
                    <option value="Maternité">Maternité</option>
                    <option value="Paternité">Paternité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                  <input
                    type="date"
                    name="dateDebut"
                    value={form.dateDebut}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin *</label>
                  <input
                    type="date"
                    name="dateFin"
                    value={form.dateFin}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motif</label>
                  <textarea
                    name="motif"
                    value={form.motif}
                    onChange={handleInputChange}
                    placeholder="Raison de la demande de congé..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-vertical"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
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
      {filteredConges.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            Affichage de {indexOfFirstConge + 1} à {Math.min(indexOfLastConge, filteredConges.length)} sur {filteredConges.length} congé(s)
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
            <span className="text-sm text-gray-600">Congés par page:</span>
            <select
              value={congesPerPage}
              onChange={(e) => {
                setCongesPerPage(Number(e.target.value));
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

      {/* Tableau des congés */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              Chargement des congés...
            </div>
          </div>
        ) : filteredConges.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "Aucun congé trouvé" : "Aucun congé enregistré"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Employé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date début</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date fin</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Motif</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentConges.map((conge, index) => (
                  <tr 
                    key={conge._id}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {conge.user ? `${conge.user.nom} ${conge.user.prenom}` : "-"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>
                          {conge.user?.role}
                          {conge.user?.service?.nomService ? ` • ${conge.user.service.nomService}` : " • Aucun service"}
                        </div>
                        {conge.user?.poste && (
                          <div className="mt-1">
                            📝 {conge.user.poste}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeCongeClass(conge.typeConge)}`}>
                        {conge.typeConge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(conge.dateDebut).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(conge.dateFin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      {conge.motif || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatutClass(conge.statut)}`}>
                        {conge.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {/* Actions pour ADMIN_RH */}
                        {userRole === "ADMIN_RH" && conge.statut === "En Attente" && (
                          <>
                            <button
                              onClick={() => updateStatut(conge._id, "Approuvé")}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                            >
                              <span>✅</span>
                              Approuver
                            </button>
                            <button
                              onClick={() => updateStatut(conge._id, "Rejeté")}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                            >
                              <span>❌</span>
                              Rejeter
                            </button>
                          </>
                        )}
                        
                        {/* Bouton supprimer */}
                        {(userRole === "ADMIN_RH" || (userRole === "SALARIE" && conge.statut === "En Attente")) && (
                          <button
                            onClick={() => handleDelete(conge)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
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
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-sm">
          <div className="text-sm opacity-90">Total demandes</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-sm">
          <div className="text-sm opacity-90">En attente</div>
          <div className="text-2xl font-bold">{stats.enAttente}</div>
        </div>
        
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-sm">
          <div className="text-sm opacity-90">Approuvés</div>
          <div className="text-2xl font-bold">{stats.approuves}</div>
        </div>
        
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-sm">
          <div className="text-sm opacity-90">Rejetés</div>
          <div className="text-2xl font-bold">{stats.rejetes}</div>
        </div>
      </div>
    </div>
  );
}