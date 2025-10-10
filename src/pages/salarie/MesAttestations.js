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
  
  const [preview, setPreview] = useState(null);

  // Récupérer les attestations du salarié
  const fetchAttestations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ⭐ CORRECTION : Utiliser une route spécifique pour salarié
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
      case 'Travail': return 'bg-blue-100 text-blue-800';
      case 'Salaire': return 'bg-green-100 text-green-800';
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
        Demandez et suivez vos attestations de travail
      </p>

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
                className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
              >
                👁️ Prévisualiser
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
          </div>

          {/* Prévisualisation */}
          {preview && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">👁️ Aperçu de l'attestation</h4>
              <div className="bg-white p-4 rounded border text-sm font-mono whitespace-pre-wrap">
                {preview.contenu}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              📨 Envoyer la demande
            </button>
            
            <button
              type="button"
              onClick={() => {
                setForm({ typeAttestation: "", contenu: "" });
                setPreview(null);
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