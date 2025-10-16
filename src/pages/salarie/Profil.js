import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function ProfilSalarie() {
  const [profil, setProfil] = useState(null);
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    telephone: "",
    adresse: "",
    nom: "",
    prenom: "",
    sexe: "",
    dateNaissance: "",
    ecole: "",
    filiere: "",
    niveau: "",
    dureeStage: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fonction pour générer les icônes Tailwind
  const getIcon = (iconName, isLarge = false) => {
    const iconClass = `w-5 h-5 ${isLarge ? 'w-6 h-6' : ''}`;
    
    switch(iconName) {
      case '👨‍💼': // Profil
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case '🔍': // Diagnostic
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case '📊': // Contrats
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case '📋': // Poste
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case '📧': // Email
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case '📅': // Date
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case '📍': // Adresse
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case '🎓': // Stage
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case '🔄': // Recharger
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case '✅': // Succès
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '⚠️': // Avertissement
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case '📞': // Téléphone
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case '💼': // Travail
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case '📄': // Document
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case '✕': // Fermer
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case '🔒': // Mot de passe
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case '👁️': // Voir
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return <span className={iconClass}>•</span>;
    }
  };

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

        // Initialiser le formulaire d'édition
        setEditForm({
          email: userProfil.email || "",
          telephone: userProfil.telephone || "",
          adresse: userProfil.adresse || "",
          nom: userProfil.nom || "",
          prenom: userProfil.prenom || "",
          sexe: userProfil.sexe || "",
          dateNaissance: userProfil.dateNaissance ? new Date(userProfil.dateNaissance).toISOString().split('T')[0] : "",
          ecole: userProfil.ecole || "",
          filiere: userProfil.filiere || "",
          niveau: userProfil.niveau || "",
          dureeStage: userProfil.dureeStage || ""
        });

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

  // Gestion de la modification du profil
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion du changement de mot de passe
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Envoyer seulement les champs modifiables
      const dataToSend = {
        email: editForm.email,
        telephone: editForm.telephone,
        adresse: editForm.adresse
      };

      const response = await api.put("/users/me", dataToSend);
      console.log("✅ Profil mis à jour:", response.data);
      
      // Mettre à jour le profil avec les nouvelles données
      setProfil(prev => ({
        ...prev,
        ...dataToSend
      }));
      
      setMessage({ 
        type: 'success', 
        text: 'Profil mis à jour avec succès' 
      });
      
      setTimeout(() => {
        setShowEditModal(false);
        setMessage({ type: '', text: '' });
      }, 2000);
      
    } catch (err) {
      console.error("❌ Erreur mise à jour profil:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || "Erreur lors de la mise à jour du profil" 
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: '', text: '' });

    // Validation des mots de passe
    if (!passwordForm.currentPassword) {
      setMessage({ 
        type: 'error', 
        text: 'Veuillez saisir votre mot de passe actuel' 
      });
      setSaveLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ 
        type: 'error', 
        text: 'Les nouveaux mots de passe ne correspondent pas' 
      });
      setSaveLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ 
        type: 'error', 
        text: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
      setSaveLoading(false);
      return;
    }

    try {
      console.log("🔐 Vérification du mot de passe...");

      // Vérifier l'ancien mot de passe avec l'endpoint dédié
      const verifyResponse = await api.post("/auth/verify-password", {
        password: passwordForm.currentPassword
      });

      console.log("✅ Réponse de vérification:", verifyResponse.data);

      if (!verifyResponse.data.isValid) {
        setMessage({ 
          type: 'error', 
          text: 'Le mot de passe actuel est incorrect' 
        });
        setSaveLoading(false);
        return;
      }

      // Si l'ancien mot de passe est correct, changer le mot de passe
      console.log("🔄 Changement du mot de passe...");
      await api.put("/users/me", {
        password: passwordForm.newPassword
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Mot de passe changé avec succès' 
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage({ type: '', text: '' });
      }, 2000);
      
    } catch (err) {
      console.error("❌ Erreur changement mot de passe:", err);
      console.error("❌ Détails de l'erreur:", err.response?.data);
      
      if (err.response?.status === 401) {
        setMessage({ 
          type: 'error', 
          text: 'Le mot de passe actuel est incorrect' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.message || "Erreur lors du changement de mot de passe" 
        });
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Ouvrir modal d'édition
  const openEditModal = () => {
    setEditForm({
      email: profil.email || "",
      telephone: profil.telephone || "",
      adresse: profil.adresse || "",
      nom: profil.nom || "",
      prenom: profil.prenom || "",
      sexe: profil.sexe || "",
      dateNaissance: profil.dateNaissance ? new Date(profil.dateNaissance).toISOString().split('T')[0] : "",
      ecole: profil.ecole || "",
      filiere: profil.filiere || "",
      niveau: profil.niveau || "",
      dureeStage: profil.dureeStage || ""
    });
    setShowEditModal(true);
    setMessage({ type: '', text: '' });
  };

  // Ouvrir modal de changement de mot de passe
  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setShowPasswordModal(true);
    setMessage({ type: '', text: '' });
  };

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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {getIcon('👨‍💼', true)}
            <h1 className="text-2xl font-bold text-gray-800">Mon Profil - Diagnostic</h1>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="font-mono text-sm whitespace-pre-wrap text-gray-600">
              {debugInfo}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {getIcon('👨‍💼', true)}
            <h1 className="text-2xl font-bold text-gray-800">Mon Profil - Erreur</h1>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="font-mono text-sm whitespace-pre-wrap text-gray-600">
              {debugInfo}
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              {getIcon('⚠️')}
              <h3 className="text-lg font-semibold text-yellow-800">Solution recommandée:</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              {error.includes("401") || error.includes("non trouvé") 
                ? "Problème d'authentification. Déconnectez-vous et reconnectez-vous."
                : "Erreur lors du chargement du profil. Vous pouvez réessayer."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleReconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {getIcon('🔄')}
                Se déconnecter
              </button>
              <button 
                onClick={handleRetry}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {getIcon('🔄')}
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* En-tête principal */}
        <div className="flex items-center gap-3 mb-6">
          {getIcon('👨‍💼', true)}
          <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
        </div>
        
        {/* Section statut */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex items-center text-gray-600 text-sm">
            {getIcon('📊')}
            <span className="ml-2">
              {contrats.length > 0 
                ? `${contrats.length} contrat(s) trouvé(s) - Service: ${service?.nomService || 'Non trouvé'}` 
                : 'Aucun contrat trouvé'}
            </span>
          </div>
        </div>

        {profil && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* En-tête du profil */}
            <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {profil.nom?.charAt(0)}{profil.prenom?.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {profil.prenom} {profil.nom}
                </h2>
                <p className="text-gray-600 mb-1 flex items-center gap-2">
                  {profil.role} • {service?.nomService || "Non assigné"}
                </p>
                {poste && (
                  <p className="text-gray-700 font-medium flex items-center gap-2">
                    {getIcon('📋')}
                    {poste}
                  </p>
                )}
                {profil.typeContrat && (
                  <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                    {getIcon('📄')}
                    {profil.typeContrat}
                  </p>
                )}
              </div>

              {/* Badge statut */}
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                contrats.some(c => c.statut === "Actif") 
                  ? "bg-green-100 text-green-800 border border-green-200" 
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}>
                {contrats.some(c => c.statut === "Actif") ? "🟢 Actif" : "⚪ Inactif"}
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {getIcon('👨‍💼')}
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {getIcon('📧')}
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{profil.email}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Sexe</div>
                  <div className="font-medium">{profil.sexe}</div>
                </div>
                <div className="flex items-center gap-2">
                  {getIcon('📅')}
                  <div>
                    <div className="text-sm text-gray-500">Date de naissance</div>
                    <div className="font-medium">{formatDate(profil.dateNaissance)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getIcon('📍')}
                  <div>
                    <div className="text-sm text-gray-500">Adresse</div>
                    <div className="font-medium">{profil.adresse}</div>
                  </div>
                </div>
                {profil.telephone && (
                  <div className="flex items-center gap-2">
                    {getIcon('📞')}
                    <div>
                      <div className="text-sm text-gray-500">Téléphone</div>
                      <div className="font-medium">{profil.telephone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations professionnelles */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {getIcon('💼')}
                Informations professionnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Rôle</div>
                  <div className="font-medium">{profil.role}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Service</div>
                  <div className="font-medium">{service?.nomService || "Non assigné"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Poste</div>
                  <div className="font-medium">{poste || "Non défini"}</div>
                </div>
                {profil.dateEmbauche && (
                  <div>
                    <div className="text-sm text-gray-500">Date d'embauche</div>
                    <div className="font-medium">{formatDate(profil.dateEmbauche)}</div>
                  </div>
                )}
                {profil.typeContrat && (
                  <div>
                    <div className="text-sm text-gray-500">Type de contrat</div>
                    <div className="font-medium">{profil.typeContrat}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Historique des contrats */}
            {contrats.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {getIcon('📊')}
                  Historique des contrats
                </h3>
                <div className="space-y-3">
                  {contrats.slice(0, 3).map((contrat, index) => (
                    <div key={contrat._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{contrat.typeContrat}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            contrat.statut === "Actif" 
                              ? "bg-green-100 text-green-800 border border-green-200" 
                              : "bg-gray-100 text-gray-800 border border-gray-200"
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {getIcon('🎓')}
                  Informations de stage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">École</div>
                    <div className="font-medium">{profil.ecole || "Non renseigné"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Filière</div>
                    <div className="font-medium">{profil.filiere || "Non renseigné"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Niveau</div>
                    <div className="font-medium">{profil.niveau || "Non renseigné"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date de début</div>
                    <div className="font-medium">{formatDate(profil.dateDebutStage)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date de fin</div>
                    <div className="font-medium">{formatDate(profil.dateFinStage)}</div>
                  </div>
                  {profil.tuteur && (
                    <div>
                      <div className="text-sm text-gray-500">Tuteur</div>
                      <div className="font-medium">{profil.tuteur}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-end pt-6 border-t border-gray-200">
              <button 
                onClick={openEditModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier le profil
              </button>
              <button 
                onClick={openPasswordModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Changer le mot de passe
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de modification du profil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier le profil
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {getIcon('✕')}
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6">
              {message.text && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Informations Personnelles</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={editForm.nom}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={editForm.prenom}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sexe
                    </label>
                    <select
                      name="sexe"
                      value={editForm.sexe}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={editForm.dateNaissance}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Champs modifiables */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Informations Modifiables</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={editForm.telephone}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="Ex: +33 1 23 45 67 89"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <textarea
                      name="adresse"
                      value={editForm.adresse}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-vertical"
                      placeholder="Votre adresse complète"
                    />
                  </div>
                </div>

                {/* Informations de stage (si stagiaire) */}
                {profil.role === "STAGIAIRE" && (
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="font-semibold text-gray-700 border-b pb-2">Informations de Stage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          École
                        </label>
                        <input
                          type="text"
                          name="ecole"
                          value={editForm.ecole}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filière
                        </label>
                        <input
                          type="text"
                          name="filiere"
                          value={editForm.filiere}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Niveau
                        </label>
                        <input
                          type="text"
                          name="niveau"
                          value={editForm.niveau}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Durée du stage (mois)
                        </label>
                        <input
                          type="number"
                          name="dureeStage"
                          value={editForm.dureeStage}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saveLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {getIcon('🔒')}
                Changer le mot de passe
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {getIcon('✕')}
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6">
              {message.text && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ancien mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 pr-10"
                      placeholder="Saisissez votre mot de passe actuel"
                      id="currentPassword"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        const input = document.getElementById('currentPassword');
                        input.type = input.type === 'password' ? 'text' : 'password';
                      }}
                    >
                      {getIcon('👁️')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mot de passe saisi: {passwordForm.currentPassword}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      required
                      minLength="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 pr-10"
                      placeholder="Au moins 6 caractères"
                      id="newPassword"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        const input = document.getElementById('newPassword');
                        input.type = input.type === 'password' ? 'text' : 'password';
                      }}
                    >
                      {getIcon('👁️')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mot de passe saisi: {passwordForm.newPassword}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      required
                      minLength="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 pr-10"
                      placeholder="Répétez le nouveau mot de passe"
                      id="confirmPassword"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        const input = document.getElementById('confirmPassword');
                        input.type = input.type === 'password' ? 'text' : 'password';
                      }}
                    >
                      {getIcon('👁️')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mot de passe saisi: {passwordForm.confirmPassword}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saveLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Modification...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Changer le mot de passe
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}