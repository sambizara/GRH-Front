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
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réessayer
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Se reconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
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
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun contrat trouvé</h3>
          <p className="text-gray-600 mb-6">Vous n'avez aucun contrat associé à votre compte.</p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
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
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Date de début
                    </div>
                    <div className="font-semibold text-gray-800">{formatDate(contrat.dateDebut)}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      {contrat.typeContrat === 'CDI' ? (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      Date de fin
                    </div>
                    <div className="font-semibold text-gray-800">
                      {contrat.typeContrat === 'CDI' ? 'Durée indéterminée' : formatDate(contrat.dateFin)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Durée
                    </div>
                    <div className="font-semibold text-gray-800">
                      {getDureeContrat(contrat.dateDebut, contrat.dateFin)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Service
                    </div>
                    <div className="font-semibold text-gray-800">
                      {contrat.service?.nomService || "Non assigné"}
                    </div>
                  </div>
                </div>

                {/* Poste et informations personnelles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Poste
                    </div>
                    <div className="font-semibold text-gray-800">
                      {contrat.poste || "Non défini"}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Titulaire du contrat
                    </div>
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

            <div className="bg-gray-500 text-white p-4 rounded-lg">
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