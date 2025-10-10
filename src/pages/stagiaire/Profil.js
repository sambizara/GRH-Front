import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function ProfilSalarie() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        setLoading(true);
        setDebugInfo("🔍 Début du diagnostic...\n");
        
        // 1. Vérifier le token dans localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        setDebugInfo(prev => prev + `🔑 Token dans localStorage: ${token ? "PRÉSENT" : "ABSENT"}\n`);
        setDebugInfo(prev => prev + `👤 User dans localStorage: ${userData ? "PRÉSENT" : "ABSENT"}\n`);
        
        if (token) {
          setDebugInfo(prev => prev + `📏 Longueur du token: ${token.length} caractères\n`);
          
          // Décoder le token pour voir son contenu
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setDebugInfo(prev => prev + `📋 Contenu du token:\n${JSON.stringify(payload, null, 2)}\n`);
            
            // Vérifier la structure du token
            if (payload.userId) {
              setDebugInfo(prev => prev + `✅ Token utilise "userId": ${payload.userId}\n`);
            } else if (payload.id) {
              setDebugInfo(prev => prev + `⚠️ Token utilise "id": ${payload.id}\n`);
            } else {
              setDebugInfo(prev => prev + `❌ Aucun ID trouvé dans le token!\n`);
            }
          } catch (e) {
            setDebugInfo(prev => prev + `❌ Impossible de décoder le token: ${e.message}\n`);
          }
        }

        // 2. Vérifier les headers de la requête
        setDebugInfo(prev => prev + `\n🌐 Tentative vers /users/me...\n`);
        
        const response = await api.get("/users/me");
        
        setDebugInfo(prev => prev + `✅ Succès! Status: ${response.status}\n`);
        console.log("✅ Profil chargé:", response.data);
        setProfil(response.data);
        
      } catch (err) {
        console.error("❌ Erreur complète:", err);
        
        let errorDetails = `\n❌ Erreur lors de la requête:\n`;
        errorDetails += `📊 Status: ${err.response?.status || 'N/A'}\n`;
        errorDetails += `📝 Message: ${err.response?.data?.message || err.message}\n`;
        errorDetails += `🔗 URL: ${err.config?.url || 'N/A'}\n`;
        errorDetails += `📦 Données erreur: ${JSON.stringify(err.response?.data || {}, null, 2)}\n`;
        
        if (err.response?.status === 401) {
          errorDetails += `💡 Solution: Token invalide ou expiré\n`;
        } else if (err.response?.status === 404) {
          errorDetails += `💡 Solution: Utilisateur non trouvé en base de données\n`;
        }
        
        setError(err.response?.data?.message || err.message);
        setDebugInfo(prev => prev + errorDetails);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfil();
  }, []);

  const handleReconnect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Non renseigné";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mon Profil - Diagnostic</h1>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap mb-4">
          {debugInfo}
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mon Profil - Erreur</h1>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap mb-6">
          {debugInfo}
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Solution recommandée:</h3>
          <p className="text-yellow-700 mb-4">
            {error.includes("401") || error.includes("non trouvé") 
              ? "Problème d'authentification. Déconnectez-vous et reconnectez-vous."
              : "Erreur lors du chargement du profil. Vous pouvez réessayer."}
          </p>
          <div className="flex gap-3">
            <button 
              onClick={handleReconnect}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Se déconnecter
            </button>
            <button 
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔁 Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <span className="text-3xl">👨‍💼</span>
        Mon Profil
      </h1>
      
      {/* Section debug réduite */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <div className="flex items-center text-blue-700">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Profil chargé avec succès via /users/me
        </div>
      </div>

      {profil && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* En-tête du profil */}
          <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {profil.nom?.charAt(0)}{profil.prenom?.charAt(0)}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {profil.prenom} {profil.nom}
              </h2>
              <p className="text-gray-600 mb-1">
                {profil.role} • {profil.service?.nomService || "Non assigné"}
              </p>
              {profil.poste && (
                <p className="text-blue-600 font-medium">
                  📋 {profil.poste}
                </p>
              )}
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Email :</strong> {profil.email}</div>
              <div><strong>Sexe :</strong> {profil.sexe}</div>
              <div><strong>Date de naissance :</strong> {formatDate(profil.dateNaissance)}</div>
              <div><strong>Adresse :</strong> {profil.adresse}</div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Rôle :</strong> {profil.role}</div>
              <div><strong>Service :</strong> {profil.service?.nomService || "Non assigné"}</div>
              {profil.dateEmbauche && (
                <div><strong>Date d'embauche :</strong> {formatDate(profil.dateEmbauche)}</div>
              )}
              {profil.poste && (
                <div><strong>Poste :</strong> {profil.poste}</div>
              )}
            </div>
          </div>

          {/* Informations spécifiques aux stagiaires */}
          {profil.role === "STAGIAIRE" && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations de stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>École :</strong> {profil.ecole}</div>
                <div><strong>Filière :</strong> {profil.filiere}</div>
                <div><strong>Niveau :</strong> {profil.niveau}</div>
                <div><strong>Date de début :</strong> {formatDate(profil.dateDebutStage)}</div>
                <div><strong>Date de fin :</strong> {formatDate(profil.dateFinStage)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}