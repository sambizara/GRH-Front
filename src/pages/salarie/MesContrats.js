import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MesContrats() {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const fetchContrats = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo("🔄 Début du chargement des contrats...\n");
        
        console.log("🔄 Chargement des contrats...");
        
        // Vérifier l'authentification
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        setDebugInfo(prev => prev + `🔑 Token: ${token ? "PRÉSENT" : "ABSENT"}\n`);
        setDebugInfo(prev => prev + `👤 User: ${user ? "PRÉSENT" : "ABSENT"}\n`);
        
        if (!token) {
          throw new Error("Non authentifié. Veuillez vous reconnecter.");
        }

        setDebugInfo(prev => prev + `🌐 Appel API: /contrats/mes/contrats\n`);
        
        const res = await api.get("/contrats/mes/contrats");
        
        setDebugInfo(prev => prev + `✅ Réponse reçue - Status: ${res.status}\n`);
        console.log("✅ Réponse contrats:", res.data);
        
        // Vérifiez la structure de la réponse
        if (!res.data) {
          throw new Error("Réponse vide du serveur");
        }
        
        if (res.data.success === false) {
          throw new Error(res.data.message || "Erreur de chargement");
        }
        
        // Gestion des différentes structures de réponse
        let contratsData = [];
        
        if (Array.isArray(res.data.contrats)) {
          contratsData = res.data.contrats;
        } else if (Array.isArray(res.data)) {
          contratsData = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          contratsData = res.data.data;
        }
        
        setDebugInfo(prev => prev + `📊 ${contratsData.length} contrat(s) trouvé(s)\n`);
        
        if (contratsData.length > 0) {
          console.log("📊 Structure du premier contrat:", contratsData[0]);
          console.log("👤 Structure user:", contratsData[0].user);
        }
        
        setContrats(contratsData);
        
      } catch (err) {
        console.error("❌ Erreur chargement contrats:", err);
        
        let errorMessage = "Erreur de chargement des contrats";
        let debugError = `❌ Erreur attrapée:\n`;
        
        if (err.response) {
          debugError += `📊 Status: ${err.response.status}\n`;
          debugError += `📝 Message: ${err.response.data?.message || 'N/A'}\n`;
          debugError += `🔗 URL: ${err.config?.url || 'N/A'}\n`;
          errorMessage = err.response.data?.message || `Erreur ${err.response.status}`;
        } else if (err.request) {
          debugError += `🌐 Pas de réponse du serveur\n`;
          errorMessage = "Impossible de contacter le serveur";
        } else {
          debugError += `💬 ${err.message}\n`;
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setDebugInfo(prev => prev + debugError);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContrats();
  }, []);

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'Actif': return '#2ecc71';
      case 'Terminé': return '#e74c3c';
      case 'Suspendu': return '#f39c12';
      case 'Résilié': return '#e67e22';
      default: return '#7f8c8d';
    }
  };

  const getTypeContratColor = (type) => {
    switch(type) {
      case 'CDI': return '#3498db';
      case 'CDD': return '#9b59b6';
      case 'Alternance': return '#1abc9c';
      case 'Stage': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Erreur formatage date:", error);
      return "Date invalide";
    }
  };

  const formatSalaire = (salaire) => {
    if (!salaire || isNaN(salaire)) return "Non défini";
    
    return new Intl.NumberFormat('mg-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salaire);
  };

  const getDureeContrat = (dateDebut, dateFin) => {
    if (!dateDebut) return "Non définie";
    
    const debut = new Date(dateDebut);
    const fin = dateFin ? new Date(dateFin) : new Date(); // Pour CDI, utiliser aujourd'hui
    
    const diffTime = Math.abs(fin - debut);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const annees = Math.floor(diffDays / 365);
    const mois = Math.floor((diffDays % 365) / 30);
    
    if (annees > 0) {
      return `${annees} an${annees > 1 ? 's' : ''} ${mois > 0 ? `et ${mois} mois` : ''}`;
    } else {
      return `${mois} mois`;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mes Contrats - Diagnostic</h1>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap mb-4">
          {debugInfo}
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Chargement de vos contrats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mes Contrats - Erreur</h1>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap mb-6">
          {debugInfo}
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Réessayer
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔑 Se reconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <span className="text-3xl">📑</span>
        Mes Contrats
      </h1>

      {/* Section debug réduite */}
      {debugInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center text-blue-700 text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {contrats.length} contrat(s) chargé(s) avec succès
          </div>
        </div>
      )}

      {contrats.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun contrat trouvé</h3>
          <p className="text-gray-600 mb-6">Vous n'avez aucun contrat associé à votre compte.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {contrats.map((contrat) => (
              <div 
                key={contrat._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                style={{ borderLeft: `4px solid ${getTypeContratColor(contrat.typeContrat)}` }}
              >
                {/* En-tête du contrat */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Contrat {contrat.typeContrat}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getTypeContratColor(contrat.typeContrat) }}
                      >
                        {contrat.typeContrat}
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getStatutColor(contrat.statut) }}
                      >
                        {contrat.statut}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatSalaire(contrat.salaire)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Salaire {contrat.typeContrat === 'Stage' ? 'stage' : 'mensuel'}
                    </div>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">📅 Date de début</div>
                    <div className="font-semibold text-gray-800">{formatDate(contrat.dateDebut)}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {contrat.typeContrat === 'CDI' ? '🏁' : '📅'} Date de fin
                    </div>
                    <div className="font-semibold text-gray-800">
                      {contrat.typeContrat === 'CDI' ? 'Durée indéterminée' : formatDate(contrat.dateFin)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">⏱️ Durée</div>
                    <div className="font-semibold text-gray-800">
                      {getDureeContrat(contrat.dateDebut, contrat.dateFin)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">🏢 Service</div>
                    <div className="font-semibold text-gray-800">
                      {contrat.service?.nomService || "Non assigné"}
                    </div>
                  </div>
                </div>

                {/* Poste et informations personnelles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">📝 Poste</div>
                    <div className="font-semibold text-gray-800">
                      {contrat.poste || "Non défini"}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">👤 Titulaire du contrat</div>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Nom:</span> {contrat.user?.nom} {contrat.user?.prenom}</div>
                      <div><span className="font-medium">Email:</span> {contrat.user?.email}</div>
                      <div><span className="font-medium">Rôle:</span> {contrat.user?.role}</div>
                      {contrat.user?.matricule && (
                        <div><span className="font-medium">Matricule:</span> {contrat.user.matricule}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date de création */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-right">
                  Créé le {formatDate(contrat.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Statistiques */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-500 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">Total contrats</div>
              <div className="text-2xl font-bold">{contrats.length}</div>
            </div>
            
            <div className="bg-green-500 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">Contrats actifs</div>
              <div className="text-2xl font-bold">
                {contrats.filter(c => c.statut === 'Actif').length}
              </div>
            </div>
            
            <div className="bg-red-500 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">Contrats terminés</div>
              <div className="text-2xl font-bold">
                {contrats.filter(c => c.statut === 'Terminé').length}
              </div>
            </div>

            <div className="bg-purple-500 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">Masse salariale</div>
              <div className="text-lg font-bold">
                {formatSalaire(contrats.reduce((total, c) => total + (c.salaire || 0), 0))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}