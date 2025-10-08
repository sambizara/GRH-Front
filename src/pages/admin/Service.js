import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Services() {
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    nomService: "",
    description: "",
    postes: []
  });
  const [newPoste, setNewPoste] = useState("");

  // État pour la vue détaillée
  const [selectedService, setSelectedService] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [serviceUsers, setServiceUsers] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage, setServicesPerPage] = useState(6);

  useEffect(() => {
    fetchServices();
    fetchUsers();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/services");
      setServices(response.data);
    } catch (error) {
      console.error("Erreur chargement services:", error);
      alert("Erreur lors du chargement des services");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  // Obtenir les utilisateurs d'un service
  const getUsersByService = (serviceId) => {
    return users.filter(user => 
      user.service && (user.service._id === serviceId || user.service === serviceId)
    );
  };

  const getUsersCountByService = (serviceId) => {
    return getUsersByService(serviceId).length;
  };

  // Afficher les utilisateurs d'un service - VERSION CORRIGÉE
  const handleShowUsers = async (service) => {
    setSelectedService(service);
    try {
      // Récupérer les utilisateurs depuis l'API
      const response = await api.get(`/services/${service._id}/users`);
      setServiceUsers(response.data.utilisateurs || []);
      setShowUsersModal(true);
    } catch (error) {
      console.error("Erreur récupération utilisateurs:", error);
      // Fallback sur les données locales
      setServiceUsers(getUsersByService(service._id));
      setShowUsersModal(true);
    }
  };

  // Filtrage
  const filteredServices = services.filter(
    (service) =>
      service.nomService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.postes && service.postes.some(poste => 
        poste.toLowerCase().includes(searchTerm.toLowerCase())
      ))
  );

  // Pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

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
    setCurrentPage(1);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ nomService: "", description: "", postes: [] });
    setNewPoste("");
    setEditingService(null);
    setShowModal(false);
  };

  // Ouvrir le modal pour ajouter
  const handleAddService = () => {
    resetForm();
    setShowModal(true);
  };

  // Ajouter un poste dans le formulaire
  const handleAddPoste = () => {
    if (newPoste.trim() !== "") {
      setForm((prev) => ({
        ...prev,
        postes: [...prev.postes, newPoste.trim().toUpperCase()]
      }));
      setNewPoste("");
    }
  };

  const handleRemovePoste = (poste) => {
    setForm((prev) => ({
      ...prev,
      postes: prev.postes.filter((p) => p !== poste)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nomService.trim()) {
      alert("Veuillez saisir un nom pour le service");
      return;
    }

    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, form);
        alert("Service modifié avec succès");
      } else {
        await api.post("/services", form);
        alert("Service créé avec succès");
      }

      resetForm();
      fetchServices();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      nomService: service.nomService,
      description: service.description || "",
      postes: service.postes || []
    });
    setShowModal(true);
  };

  const handleDelete = async (service) => {
    const usersCount = getUsersCountByService(service._id);

    if (usersCount > 0) {
      if (
        !window.confirm(
          `Êtes-vous sûr de vouloir supprimer le service "${service.nomService}" ?\n\n` +
            `⚠️ Ce service contient ${usersCount} utilisateur(s). ` +
            `Cette action désassignera tous les utilisateurs de ce service.`
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          `Êtes-vous sûr de vouloir supprimer le service "${service.nomService}" ?`
        )
      ) {
        return;
      }
    }

    try {
      await api.patch(`/services/${service._id}/deactivate`);
      alert("Service supprimé avec succès");
      fetchServices();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Fonction pour obtenir la répartition par rôle
  const getRoleDistribution = (serviceUsers) => {
    const distribution = {
      SALARIE: 0,
      STAGIAIRE: 0,
      ADMIN_RH: 0
    };
    
    serviceUsers.forEach(user => {
      if (distribution.hasOwnProperty(user.role)) {
        distribution[user.role]++;
      }
    });
    
    return distribution;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏢 Gestion des Services</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <button
            onClick={handleAddService}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <span>+</span>
            Nouveau service
          </button>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingService ? "Modifier le service" : "Ajouter un nouveau service"}
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
                    Nom du service *
                  </label>
                  <input
                    type="text"
                    name="nomService"
                    value={form.nomService}
                    onChange={handleInputChange}
                    placeholder="Nom du service"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Description du service"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-vertical"
                  />
                </div>

                {/* Gestion des postes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postes
                  </label>
                  <div className="flex gap-3 mt-2">
                    <input
                      type="text"
                      value={newPoste}
                      onChange={(e) => setNewPoste(e.target.value)}
                      placeholder="Ajouter un poste"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddPoste}
                      className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  
                  {form.postes.length > 0 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postes ajoutés ({form.postes.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {form.postes.map((poste, index) => (
                          <div key={index} className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                            {poste}
                            <button 
                              type="button" 
                              onClick={() => handleRemovePoste(poste)}
                              className="ml-2 text-red-500 hover:text-red-700 text-sm font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    {editingService ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {filteredServices.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            Affichage de {indexOfFirstService + 1} à {Math.min(indexOfLastService, filteredServices.length)} sur {filteredServices.length} service(s)
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
            <span className="text-sm text-gray-600">Services par page:</span>
            <select
              value={servicesPerPage}
              onChange={(e) => {
                setServicesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
            >
              <option value={3}>3</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      )}

      {/* TABLEAU DES SERVICES */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              Chargement des services...
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "Aucun service trouvé" : "Aucun service enregistré"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Postes</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Utilisateurs</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.map((service, index) => {
                  const serviceUsers = getUsersByService(service._id);
                  const roleDistribution = getRoleDistribution(serviceUsers);
                  
                  return (
                    <tr 
                      key={service._id}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 mb-1">
                          {service.nomService}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.postes?.length || 0} poste(s) défini(s)
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                        {service.description ? (
                          <div>
                            {service.description.length > 100 
                              ? `${service.description.substring(0, 100)}...` 
                              : service.description
                            }
                          </div>
                        ) : (
                          <span className="italic text-gray-400">
                            Aucune description
                          </span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3 min-w-[200px]">
                        {service.postes && service.postes.length > 0 ? (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {service.postes.slice(0, 3).map((p, i) => (
                                <span key={i} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                            {service.postes.length > 3 && (
                              <div className="text-xs text-gray-500 mt-1">
                                +{service.postes.length - 3} autre(s)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Aucun poste défini</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-2">
                          <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {serviceUsers.length}
                          </span>
                          
                          {serviceUsers.length > 0 && (
                            <div className="flex gap-2 text-xs">
                              {roleDistribution.SALARIE > 0 && (
                                <span className="text-blue-600 font-medium">💼{roleDistribution.SALARIE}</span>
                              )}
                              {roleDistribution.STAGIAIRE > 0 && (
                                <span className="text-green-600 font-medium">🎓{roleDistribution.STAGIAIRE}</span>
                              )}
                              {roleDistribution.ADMIN_RH > 0 && (
                                <span className="text-red-600 font-medium">🔧{roleDistribution.ADMIN_RH}</span>
                              )}
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleShowUsers(service)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              serviceUsers.length > 0 
                                ? "border border-blue-500 text-blue-500 hover:bg-blue-50" 
                                : "border border-gray-400 text-gray-400 cursor-not-allowed"
                            }`}
                            disabled={serviceUsers.length === 0}
                          >
                            {serviceUsers.length > 0 ? "Voir détails" : "Aucun utilisateur"}
                          </button>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(service)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <span>✏️</span>
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            className="bg-gray-200 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <span>🗑️</span>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL UTILISATEURS */}
      {showUsersModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  👥 Utilisateurs du service : {selectedService.nomService}
                </h3>
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="text-white hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
                  <strong>Total :</strong> {serviceUsers.length} utilisateur(s)
                </div>
                <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
                  <strong>Postes disponibles :</strong> {selectedService.postes?.length || 0}
                </div>
              </div>

              {serviceUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-lg">Aucun utilisateur assigné à ce service</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom & Prénom</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rôle</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Poste</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceUsers.map((user, index) => (
                        <tr key={user._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium">
                            {user.nom} {user.prenom}
                          </td>
                          <td className="px-4 py-3 text-blue-600">
                            {user.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${
                              user.role === "ADMIN_RH" ? "bg-red-500" :
                              user.role === "SALARIE" ? "bg-blue-500" : "bg-green-500"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.poste ? (
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                {user.poste}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Non défini</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Total services</div>
          <div className="text-2xl font-bold text-gray-800">{services.length}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Services avec postes</div>
          <div className="text-2xl font-bold text-gray-800">
            {services.filter(s => s.postes && s.postes.length > 0).length}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Total utilisateurs assignés</div>
          <div className="text-2xl font-bold text-gray-800">
            {users.filter(u => u.service).length}
          </div>
        </div>
      </div>
    </div>
  );
}