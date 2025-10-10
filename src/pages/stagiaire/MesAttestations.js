import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axiosConfig";

export default function MesAttestations() {
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    typeAttestation: "",
    contenu: ""
  });
  
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const fetchAttestations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/attestations/mes-attestations");
      setAttestations(response.data.attestations || []);
      
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

  const handleEligibility = async () => {
    try {
        setCheckingEligibility(true);
        const response = await api.get("/attestations/stagiaire/eligibility");
        setEligibility(response.data);
        console.log("✅ Réponse éligibilité:", response.data);
    } catch (error) {
        console.error("❌ Erreur éligibilité détaillée:", error);
        console.error("❌ Response data:", error.response?.data);
        console.error("❌ Response status:", error.response?.status);
        
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            "Erreur lors de la vérification d'éligibilité";
        
        alert(`❌ ${errorMessage}`);
    } finally {
        setCheckingEligibility(false);
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.typeAttestation) {
      alert("Veuillez sélectionner un type d'attestation");
      return;
    }

    try {
      await api.post("/attestations/stagiaire/demande", form);
      alert("✅ Demande d'attestation envoyée avec succès");
      setForm({ typeAttestation: "", contenu: "" });
      fetchAttestations();
    } catch (err) {
      console.error("❌ Erreur demande attestation:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la demande d'attestation";
      alert(`❌ ${errorMessage}`);
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'Approuvé': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejeté': return 'bg-red-100 text-red-800 border-red-200';
      case 'En Attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Stage': return 'bg-blue-100 text-blue-800';
      case 'Travail': return 'bg-purple-100 text-purple-800';
      case 'Salaire': return 'bg-orange-100 text-orange-800';
      case 'Autre': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <h2 className="text-2xl font-bold mb-4">❌ Erreur</h2>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchAttestations();
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
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <span className="text-3xl">📄</span>
        Mes Attestations
      </h1>
      <p className="text-gray-600 mb-8">
        Demandez et suivez vos attestations de stage
      </p>

      {/* Vérification d'éligibilité */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          🎓 Vérification d'éligibilité
        </h3>
        <p className="text-blue-700 mb-4">
          En tant que stagiaire, vous devez vérifier votre éligibilité avant de faire une demande.
        </p>
        <button
          onClick={handleEligibility}
          disabled={checkingEligibility}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300"
        >
          {checkingEligibility ? "Vérification..." : "Vérifier mon éligibilité"}
        </button>
        
        {eligibility && (
          <div className={`mt-4 p-3 rounded-lg ${eligibility.eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {eligibility.eligible ? '✅ ' : '❌ '}
            {eligibility.reason}
          </div>
        )}
      </div>

      {/* Formulaire de demande */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          📨 Nouvelle demande d'attestation
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez un type</option>
                <option value="Stage">Attestation de Stage</option>
                <option value="Autre">Autre</option>
              </select>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!form.typeAttestation}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              📨 Envoyer la demande
            </button>
            
            <button
              type="button"
              onClick={() => {
                setForm({ typeAttestation: "", contenu: "" });
              }}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔄 Annuler
            </button>
          </div>
        </form>
      </div>

      {/* Liste des attestations */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">📜 Mes demandes d'attestation</h3>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            Chargement de vos attestations...
          </div>
        ) : attestations.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg">Aucune demande d'attestation pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date demande</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Contenu</th>
                </tr>
              </thead>
              <tbody>
                {attestations.map((attestation, index) => (
                  <tr 
                    key={attestation._id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(attestation.typeAttestation)}`}>
                        {attestation.typeAttestation}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(attestation.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-4 py-2 rounded-full text-xs font-semibold min-w-[100px] border ${getStatutColor(attestation.statut)}`}>
                        {attestation.statut}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600 max-w-xs">
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
        )}
      </div>
    </div>
  );
}