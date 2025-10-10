import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axiosConfig";

export default function MesConges() {
  const [conges, setConges] = useState([]);
  const [soldes, setSoldes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('demande');
  const [form, setForm] = useState({
    typeConge: "",
    dateDebut: "",
    dateFin: "",
    motif: ""
  });

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
      
      fetchConges();
      fetchSoldes();
    } catch (err) {
      console.error("❌ Erreur demande congé:", err);
      alert(err.response?.data?.message || "Erreur lors de la demande de congé");
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'Approuvé': return 'bg-green-500 text-white';
      case 'Rejeté': return 'bg-red-500 text-white';
      case 'En Attente': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeCongeColor = (type) => {
    switch(type) {
      case 'Annuel': return 'bg-blue-500 text-white';
      case 'Maladie': return 'bg-purple-500 text-white';
      case 'Sans Solde': return 'bg-orange-500 text-white';
      case 'Maternité': return 'bg-pink-500 text-white';
      case 'Paternité': return 'bg-blue-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSoldeColor = (restant, initial) => {
    const pourcentage = (restant / initial) * 100;
    if (pourcentage > 50) return 'text-green-500';
    if (pourcentage > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (error) {
    return (
      <div className="p-5 text-center text-red-500">
        <h2 className="text-2xl font-bold mb-4">❌ Erreur</h2>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchConges();
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📅 Gestion des Congés</h1>

      {/* Navigation par onglets */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('demande')}
          className={`px-6 py-3 rounded-t-lg font-medium transition-all ${
            activeTab === 'demande' 
              ? 'bg-blue-500 text-white' 
              : 'bg-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📨 Demander un congé
        </button>
        <button
          onClick={() => setActiveTab('soldes')}
          className={`px-6 py-3 rounded-t-lg font-medium transition-all ${
            activeTab === 'soldes' 
              ? 'bg-blue-500 text-white' 
              : 'bg-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          💰 Mes soldes
        </button>
      </div>

      {/* Onglet Demande de congé */}
      {activeTab === 'demande' && (
        <>
          {/* Carte des soldes rapides */}
          {soldes && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 mb-2">Congés Annuels</div>
                <div className="text-2xl font-bold text-blue-600">
                  {soldes.annuel || 0} jours
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  {soldes.annuel || 0}/30 jours restants
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-600 mb-2">Congés Maladie</div>
                <div className="text-2xl font-bold text-purple-600">
                  {soldes.maladie || 0} jours
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  {soldes.maladie || 0}/15 jours restants
                </div>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <div className="text-sm text-pink-600 mb-2">Maternité</div>
                <div className="text-2xl font-bold text-pink-600">
                  {soldes.maternite || 0} jours
                </div>
                <div className="text-xs text-pink-500 mt-1">
                  {soldes.maternite || 0}/112 jours restants
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 mb-2">Paternité</div>
                <div className="text-2xl font-bold text-green-600">
                  {soldes.paternite || 0} jours
                </div>
                <div className="text-xs text-green-500 mt-1">
                  {soldes.paternite || 0}/14 jours restants
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de demande */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">➕ Nouvelle demande de congé</h3>
            
            <form onSubmit={demanderConge}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de congé *
                  </label>
                  <select 
                    name="typeConge"
                    value={form.typeConge}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choisir un type</option>
                    <option value="Annuel">Annuel ({soldes?.annuel || 0} jours restants)</option>
                    <option value="Maladie">Maladie ({soldes?.maladie || 0} jours restants)</option>
                    <option value="Sans Solde">Sans solde</option>
                    <option value="Maternité">Maternité ({soldes?.maternite || 0} jours restants)</option>
                    <option value="Paternité">Paternité ({soldes?.paternite || 0} jours restants)</option>
                  </select>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  {form.dateDebut && form.dateFin && (
                    <div className="bg-blue-50 p-3 rounded-lg w-full">
                      <div className="text-sm text-blue-600">
                        ⏱️ Durée demandée: <strong>{calculerJoursDemandes()} jour(s)</strong>
                      </div>
                    </div>
                  )}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>

              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                📨 Envoyer la demande
              </button>
            </form>
          </div>

          {/* Liste des congés */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">📋 Mes demandes de congé</h3>
            
            {loading ? (
              <div className="text-center py-10 text-gray-500">
                <div className="text-4xl mb-4">⏳</div>
                Chargement de vos congés...
              </div>
            ) : conges.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg">Aucune demande de congé pour le moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Période</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Durée</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Statut</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Motif</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date demande</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conges.map((conge, index) => {
                      const duree = Math.ceil((new Date(conge.dateFin) - new Date(conge.dateDebut)) / (1000 * 60 * 60 * 24)) + 1;
                      
                      return (
                        <tr 
                          key={conge._id}
                          className={`border-b border-gray-200 ${
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          } hover:bg-gray-100 transition-colors`}
                        >
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeCongeColor(conge.typeConge)}`}>
                              {conge.typeConge}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            <div><strong>Début:</strong> {new Date(conge.dateDebut).toLocaleDateString()}</div>
                            <div><strong>Fin:</strong> {new Date(conge.dateFin).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {duree} jour{duree > 1 ? 's' : ''}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-4 py-2 rounded-full text-xs font-semibold min-w-[100px] ${getStatutColor(conge.statut)}`}>
                              {conge.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs">
                            {conge.motif || (
                              <span className="italic text-gray-400">
                                Aucun motif
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(conge.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Onglet Soldes */}
      {activeTab === 'soldes' && soldes && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-8">💰 Mes soldes de congé</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Carte Congés Annuels */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl mr-4">
                  📅
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Congés Annuels</h4>
                  <p className="text-gray-500 text-sm">Solde annuel</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
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
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl mr-4">
                  🏥
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Congés Maladie</h4>
                  <p className="text-gray-500 text-sm">Arrêts maladie</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
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
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white text-xl mr-4">
                  👶
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Maternité</h4>
                  <p className="text-gray-500 text-sm">Congé maternité</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
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
          </div>
        </div>
      )}
    </div>
  );
}