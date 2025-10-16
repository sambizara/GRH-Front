import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axiosConfig";

export default function MesConges() {
  const [conges, setConges] = useState([]);
  const [soldes, setSoldes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('soldes');
  const [currentPage, setCurrentPage] = useState(1);
  const [congesPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    typeConge: "",
    dateDebut: "",
    dateFin: "",
    motif: ""
  });

  // Fonction pour générer les icônes Tailwind
  const getIcon = (iconName, isLarge = false) => {
    const iconClass = `w-5 h-5 ${isLarge ? 'w-6 h-6' : ''}`;
    
    switch(iconName) {
      case '📅': // Congés
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
      case '💰': // Soldes
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
      case '⏱️': // Durée
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  const fetchConges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🌐 Chargement des congés salarié...");
      const res = await api.get("/conges/mes-conges");
      
      console.log("✅ Réponse salarié:", res.data);
      
      if (res.data.success) {
        setConges(res.data.conges || []);
        setSoldes(res.data.soldes);
      } else {
        throw new Error(res.data.message || "Erreur de chargement");
      }
      
    } catch (err) {
      console.error("❌ Erreur chargement congés:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSoldes = useCallback(async () => {
    try {
      console.log("🔄 Chargement des soldes...");
      const res = await api.get("/conges/mes-soldes");
      setSoldes(res.data);
      console.log("✅ Soldes chargés:", res.data);
    } catch (err) {
      console.error("❌ Erreur chargement soldes:", err);
    }
  }, []);

  useEffect(() => { 
    fetchConges();
    fetchSoldes();
  }, [fetchConges, fetchSoldes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const calculerJoursDemandes = () => {
    if (form.dateDebut && form.dateFin) {
      const debut = new Date(form.dateDebut);
      const fin = new Date(form.dateFin);
      const diffTime = Math.abs(fin - debut);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const demanderConge = async (e) => {
    e.preventDefault();
    
    if (!form.typeConge || !form.dateDebut || !form.dateFin) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (new Date(form.dateDebut) >= new Date(form.dateFin)) {
      alert("La date de fin doit être après la date de début");
      return;
    }

    const joursDemandes = calculerJoursDemandes();
    console.log("📅 Jours demandés:", joursDemandes);

    try {
      await api.post("/conges", form);
      alert("✅ Demande de congé envoyée avec succès");
      
      setForm({
        typeConge: "",
        dateDebut: "",
        dateFin: "",
        motif: ""
      });
      
      setShowModal(false);
      fetchConges();
      fetchSoldes();
    } catch (err) {
      console.error("❌ Erreur demande congé:", err);
      alert(err.response?.data?.message || "Erreur lors de la demande de congé");
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

  const getTypeCongeClass = (type) => {
    switch(type) {
      case 'Annuel': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Maladie': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Sans Solde': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Maternité': return 'bg-pink-100 text-pink-800 border border-pink-200';
      case 'Paternité': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getSoldeColor = (restant, initial) => {
    const pourcentage = (restant / initial) * 100;
    if (pourcentage > 50) return 'text-green-600';
    if (pourcentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Pagination pour les congés
  const indexOfLastConge = currentPage * congesPerPage;
  const indexOfFirstConge = indexOfLastConge - congesPerPage;
  const currentConges = conges.slice(indexOfFirstConge, indexOfLastConge);
  const totalPages = Math.ceil(conges.length / congesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({
      typeConge: "",
      dateDebut: "",
      dateFin: "",
      motif: ""
    });
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
                fetchConges();
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
          {getIcon('📅', true)}
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Congés</h1>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg p-1 mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {[
              { key: 'soldes', label: 'Mes soldes', icon: '💰' },
              { key: 'historique', label: 'Historique', icon: '📊' }
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
              </button>
            ))}
          </div>
        </div>

        {/* Bouton pour ouvrir la modal de demande */}
        <div className="mb-6">
          <button
            onClick={openModal}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {getIcon('➕')}
            Demander un congé
          </button>
        </div>

        {/* Modal de demande de congé */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  {getIcon('➕')}
                  Nouvelle demande de congé
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {getIcon('✕')}
                </button>
              </div>
              
              <form onSubmit={demanderConge} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de congé *
                    </label>
                    <select 
                      name="typeConge"
                      value={form.typeConge}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Choisir un type</option>
                      <option value="Annuel">Annuel ({soldes?.annuel || 0} jours restants)</option>
                      <option value="Maladie">Maladie ({soldes?.maladie || 0} jours restants)</option>
                      <option value="Sans Solde">Sans solde</option>
                      <option value="Maternité">Maternité ({soldes?.maternite || 0} jours restants)</option>
                      <option value="Paternité">Paternité ({soldes?.paternite || 0} jours restants)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    {form.dateDebut && form.dateFin && (
                      <div className="bg-blue-50 p-3 rounded-lg w-full border border-blue-200">
                        <div className="text-sm text-blue-700 flex items-center gap-2">
                          {getIcon('⏱️')}
                          <strong>{calculerJoursDemandes()} jour(s)</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={form.dateDebut}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      value={form.dateFin}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif (optionnel)
                  </label>
                  <textarea
                    name="motif"
                    value={form.motif}
                    onChange={handleInputChange}
                    placeholder="Raison de votre demande de congé..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {getIcon('📨')}
                    Envoyer la demande
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Onglet Soldes */}
        {activeTab === 'soldes' && soldes && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              {getIcon('💰')}
              Mes soldes de congé
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Carte Congés Annuels */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    {getIcon('📅')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Congés Annuels</h4>
                    <p className="text-gray-500 text-sm">Solde annuel</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Solde restant:</span>
                    <span className={`font-bold text-lg ${getSoldeColor(soldes.annuel || 0, 30)}`}>
                      {soldes.annuel || 0} jours
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Sur 30 jours annuels
                  </div>
                </div>
              </div>

              {/* Carte Congés Maladie */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
                    {getIcon('🏥')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Congés Maladie</h4>
                    <p className="text-gray-500 text-sm">Arrêts maladie</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Solde restant:</span>
                    <span className={`font-bold text-lg ${getSoldeColor(soldes.maladie || 0, 15)}`}>
                      {soldes.maladie || 0} jours
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Sur 15 jours maladie
                  </div>
                </div>
              </div>

              {/* Carte Maternité */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mr-4">
                    {getIcon('👶')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Maternité</h4>
                    <p className="text-gray-500 text-sm">Congé maternité</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Solde restant:</span>
                    <span className="font-bold text-lg text-gray-800">
                      {soldes.maternite || 0} jours
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Sur 112 jours de maternité
                  </div>
                </div>
              </div>

              {/* Carte Paternité */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    {getIcon('👨')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Paternité</h4>
                    <p className="text-gray-500 text-sm">Congé paternité</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Solde restant:</span>
                    <span className="font-bold text-lg text-gray-800">
                      {soldes.paternite || 0} jours
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Sur 14 jours de paternité
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Historique */}
        {activeTab === 'historique' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {getIcon('📋')}
                Historique de mes congés
              </h3>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de vos congés...</p>
              </div>
            ) : conges.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-lg">Aucune demande de congé pour le moment</p>
              </div>
            ) : (
              <>
                {/* Pagination */}
                {conges.length > 0 && (
                  <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-gray-600 text-sm flex items-center gap-2">
                      {getIcon('📊')}
                      Affichage de {indexOfFirstConge + 1} à {Math.min(indexOfLastConge, conges.length)} sur {conges.length} congé(s)
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

                {/* Tableau des congés */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-600 text-white">
                        <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Période</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Durée</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Statut</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Motif</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Date demande</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentConges.map((conge, index) => {
                        const duree = Math.ceil((new Date(conge.dateFin) - new Date(conge.dateDebut)) / (1000 * 60 * 60 * 24)) + 1;
                        
                        return (
                          <tr 
                            key={conge._id}
                            className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                          >
                            <td className="px-4 py-3">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeCongeClass(conge.typeConge)}`}>
                                {conge.typeConge}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                {new Date(conge.dateDebut).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="text-sm text-gray-500">
                                au {new Date(conge.dateFin).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {duree} jour{duree > 1 ? 's' : ''}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatutClass(conge.statut)}`}>
                                {conge.statut}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 max-w-xs">
                              {conge.motif || (
                                <span className="italic text-gray-400">
                                  Aucun motif
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-600">
                                {new Date(conge.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}