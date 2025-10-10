import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function ProfilSalarie() {
  const [profil, setProfil] = useState(null);
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const fetchProfilComplet = async () => {
      try {
        setLoading(true);
        setDebugInfo("🔍 Début du diagnostic...\n");
        
        // 1. Vérifier le token dans localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        setDebugInfo(prev => prev + `🔑 Token dans localStorage: ${token ? "PRÉSENT" : "ABSENT"}\n`);
        setDebugInfo(prev => prev + `👤 User dans localStorage: ${userData ? "PRÉSENT" : "ABSENT"}\n`);

        // 2. Récupérer le profil utilisateur
        setDebugInfo(prev => prev + `\n🌐 Tentative vers /users/me...\n`);
        const userResponse = await api.get("/users/me");
        
        setDebugInfo(prev => prev + `✅ Profil utilisateur chargé! Status: ${userResponse.status}\n`);
        console.log("✅ Profil utilisateur:", userResponse.data);
        
        const userProfil = userResponse.data;
        setProfil(userProfil);

        // 3. Récupérer les contrats pour avoir le service et le poste
        setDebugInfo(prev => prev + `\n🌐 Tentative vers /contrats/mes/contrats...\n`);
        try {
          const contratsResponse = await api.get("/contrats/mes/contrats");
          setDebugInfo(prev => prev + `✅ Contrats chargés! Status: ${contratsResponse.status}\n`);
          console.log("✅ Contrats:", contratsResponse.data);
          
          const contratsData = contratsResponse.data.contrats || contratsResponse.data || [];
          setContrats(contratsData);

          // 4. Trouver le contrat actif pour extraire service et poste
          const contratActif = contratsData.find(contrat => 
            contrat.statut === "Actif" && 
            (!contrat.dateFin || new Date(contrat.dateFin) >= new Date())
          );

          if (contratActif) {
            console.log("✅ Contrat actif trouvé:", contratActif);
            setDebugInfo(prev => prev + `✅ Contrat actif trouvé avec service: ${contratActif.service?.nomService}\n`);
            
            // Mettre à jour le profil avec les infos du contrat
            setProfil(prevProfil => ({
              ...prevProfil,
              service: contratActif.service,
              poste: contratActif.poste,
              dateEmbauche: contratActif.dateDebut,
              typeContrat: contratActif.typeContrat
            }));
          } else {
            setDebugInfo(prev => prev + `⚠️ Aucun contrat actif trouvé\n`);
          }

        } catch (contratError) {
          setDebugInfo(prev => prev + `❌ Erreur contrats: ${contratError.response?.data?.message || contratError.message}\n`);
          console.error("❌ Erreur chargement contrats:", contratError);
        }
        
      } catch (err) {
        console.error("❌ Erreur complète:", err);
        
        let errorDetails = `\n❌ Erreur lors de la requête:\n`;
        errorDetails += `📊 Status: ${err.response?.status || 'N/A'}\n`;
        errorDetails += `📝 Message: ${err.response?.data?.message || err.message}\n`;
        errorDetails += `🔗 URL: ${err.config?.url || 'N/A'}\n`;
        
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
    
    fetchProfilComplet();
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
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return "Date invalide";
    }
  };

  // Fonction pour obtenir le service et poste actuels
  const getServiceEtPosteActuels = () => {
    if (profil?.service && profil?.poste) {
      return { service: profil.service, poste: profil.poste };
    }

    // Chercher dans les contrats actifs
    const contratActif = contrats.find(contrat => 
      contrat.statut === "Actif" && 
      (!contrat.dateFin || new Date(contrat.dateFin) >= new Date())
    );

    if (contratActif) {
      return {
        service: contratActif.service,
        poste: contratActif.poste
      };
    }

    // Si pas de contrat actif, prendre le dernier contrat
    const dernierContrat = contrats[0];
    if (dernierContrat) {
      return {
        service: dernierContrat.service,
        poste: dernierContrat.poste
      };
    }

    return { service: null, poste: null };
  };

  const { service, poste } = getServiceEtPosteActuels();

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
        <div className="flex items-center text-blue-700 text-sm">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {contrats.length > 0 
            ? `${contrats.length} contrat(s) trouvé(s) - Service: ${service?.nomService || 'Non trouvé'}` 
            : 'Aucun contrat trouvé'}
        </div>
      </div>

      {profil && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* En-tête du profil */}
          <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {profil.nom?.charAt(0)}{profil.prenom?.charAt(0)}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {profil.prenom} {profil.nom}
              </h2>
              <p className="text-gray-600 mb-1">
                {profil.role} • {service?.nomService || "Non assigné"}
              </p>
              {poste && (
                <p className="text-blue-600 font-medium">
                  📋 {poste}
                </p>
              )}
              {profil.typeContrat && (
                <p className="text-green-600 text-sm mt-1">
                  📄 {profil.typeContrat}
                </p>
              )}
            </div>

            {/* Badge statut */}
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {contrats.some(c => c.statut === "Actif") ? "🟢 Actif" : "⚪ Inactif"}
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
              {profil.telephone && (
                <div><strong>Téléphone :</strong> {profil.telephone}</div>
              )}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Rôle :</strong> {profil.role}</div>
              <div><strong>Service :</strong> {service?.nomService || "Non assigné"}</div>
              <div><strong>Poste :</strong> {poste || "Non défini"}</div>
              {profil.dateEmbauche && (
                <div><strong>Date d'embauche :</strong> {formatDate(profil.dateEmbauche)}</div>
              )}
              {profil.typeContrat && (
                <div><strong>Type de contrat :</strong> {profil.typeContrat}</div>
              )}
            </div>
          </div>

          {/* Historique des contrats */}
          {contrats.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Historique des contrats</h3>
              <div className="space-y-3">
                {contrats.slice(0, 3).map((contrat, index) => (
                  <div key={contrat._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-800">{contrat.typeContrat}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          contrat.statut === "Actif" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {contrat.statut}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(contrat.dateDebut)} → {contrat.dateFin ? formatDate(contrat.dateFin) : "Indéterminé"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {contrat.service?.nomService && `Service: ${contrat.service.nomService}`}
                      {contrat.poste && ` • Poste: ${contrat.poste}`}
                    </div>
                  </div>
                ))}
                {contrats.length > 3 && (
                  <div className="text-center text-sm text-gray-500">
                    + {contrats.length - 3} autre(s) contrat(s)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations spécifiques aux stagiaires */}
          {profil.role === "STAGIAIRE" && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations de stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>École :</strong> {profil.ecole || "Non renseigné"}</div>
                <div><strong>Filière :</strong> {profil.filiere || "Non renseigné"}</div>
                <div><strong>Niveau :</strong> {profil.niveau || "Non renseigné"}</div>
                <div><strong>Date de début :</strong> {formatDate(profil.dateDebutStage)}</div>
                <div><strong>Date de fin :</strong> {formatDate(profil.dateFinStage)}</div>
                {profil.tuteur && (
                  <div><strong>Tuteur :</strong> {profil.tuteur}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}