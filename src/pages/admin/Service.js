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

  // Obtenir les utilisateurs d'un service - VERSION CORRIGÉE
  const getUsersByService = (serviceId) => {
    return users.filter(user => {
      if (!user.service) return false;
      
      // Gérer les deux cas : service comme objet ou comme ID string
      if (typeof user.service === 'object' && user.service !== null) {
        return user.service._id === serviceId;
      } else {
        return user.service === serviceId;
      }
    });
  };

  const getUsersCountByService = (serviceId) => {
    return getUsersByService(serviceId).length;
  };

  // Afficher les utilisateurs d'un service
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
      {/* En-tête aligné à gauche */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Services</h1>
            <p className="text-gray-600">Organisez et gérez les services de l'entreprise</p>
          </div>
        </div>
      </div>

      {/* Barre de recherche et bouton */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un service par nom, description ou poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddService}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau service
          </button>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingService ? "Modifier le service" : "Ajouter un nouveau service"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-vertical"
                  />
                </div>

                {/* Gestion des postes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postes
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newPoste}
                      onChange={(e) => setNewPoste(e.target.value)}
                      placeholder="Ajouter un poste"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddPoste}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                    >
                      Ajouter
                    </button>
                  </div>
                  
                  {form.postes.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postes ajoutés ({form.postes.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {form.postes.map((poste, index) => (
                          <div key={index} className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
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
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                  >
                    {editingService ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total services</p>
              <p className="text-2xl font-bold text-gray-800">{services.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Services avec postes</p>
              <p className="text-2xl font-bold text-gray-800">
                {services.filter(s => s.postes && s.postes.length > 0).length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.service).length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Services actifs</p>
              <p className="text-2xl font-bold text-gray-800">
                {services.filter(s => s.actif !== false).length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* PAGINATION */}
      {filteredServices.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-gray-600 text-sm">
            Affichage de {indexOfFirstService + 1} à {Math.min(indexOfLastService, filteredServices.length)} sur {filteredServices.length} service(s)
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Services par page:</span>
              <select
                value={servicesPerPage}
                onChange={(e) => {
                  setServicesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-gray-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLEAU DES SERVICES */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "Aucun service trouvé" : "Aucun service enregistré"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-600 text-white">
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
                        <div className="font-medium text-gray-900 mb-1">
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
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3 min-w-[200px]">
                        {service.postes && service.postes.length > 0 ? (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {service.postes.slice(0, 3).map((p, i) => (
                                <span key={i} className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium border border-gray-200">
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
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-2">
                          <span className="inline-block bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {serviceUsers.length}
                          </span>
                          
                          {serviceUsers.length > 0 && (
                            <div className="flex gap-2 text-xs">
                              {roleDistribution.SALARIE > 0 && (
                                <span className="text-gray-700 font-medium">💼{roleDistribution.SALARIE}</span>
                              )}
                              {roleDistribution.STAGIAIRE > 0 && (
                                <span className="text-gray-700 font-medium">🎓{roleDistribution.STAGIAIRE}</span>
                              )}
                              {roleDistribution.ADMIN_RH > 0 && (
                                <span className="text-gray-700 font-medium">🔧{roleDistribution.ADMIN_RH}</span>
                              )}
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleShowUsers(service)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              serviceUsers.length > 0 
                                ? "border border-gray-600 text-gray-600 hover:bg-gray-50" 
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
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-gray-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors border border-red-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
            <div className="bg-gray-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Utilisateurs du service : {selectedService.nomService}
                </h3>
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded text-sm font-medium">
                  <strong>Total :</strong> {serviceUsers.length} utilisateur(s)
                </div>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded text-sm font-medium">
                  <strong>Postes disponibles :</strong> {selectedService.postes?.length || 0}
                </div>
              </div>

              {serviceUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-lg font-medium">Aucun utilisateur assigné à ce service</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Nom & Prénom</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Rôle</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Poste</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceUsers.map((user, index) => (
                        <tr key={user._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {user.nom} {user.prenom}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${
                              user.role === "ADMIN_RH" ? "bg-red-500" :
                              user.role === "SALARIE" ? "bg-gray-600" : "bg-blue-500"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.poste ? (
                              <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                {user.poste}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
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
    </div>
  );
}