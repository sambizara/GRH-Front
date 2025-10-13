import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Employés total', value: '0', color: 'bg-blue-500', key: 'totalUsers', icon: '👥' },
    { label: 'Congés en cours', value: '0', color: 'bg-orange-500', key: 'enConge', icon: '🏖️' },
    { label: 'Stagiaires', value: '0', color: 'bg-green-500', key: 'stagiaires', icon: '🎓' },
    { label: 'Contrats en cours', value: '0', color: 'bg-purple-500', key: 'contrats', icon: '📝' },
  ]);
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Nouvelles données pour les diagrammes
  const [userStats, setUserStats] = useState({
    total: 0,
    salarie: 0,
    stagiaire: 0,
    adminRh: 0
  });

  const [contratStats, setContratStats] = useState({
    total: 0,
    cdi: 0,
    cdd: 0,
    stage: 0,
    interim: 0,
    autres: 0
  });

  // Fonction pour calculer "il y a X temps"
  const calculateTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
      return `${diffInMinutes}min`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}j`;
    }
  };

  // Récupérer le rôle de l'utilisateur connecté
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get("/users/me");
      setUserRole(response.data.role);
      return response.data.role;
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
      return null;
    }
  }, []);

  // 🔹 STATISTIQUES UTILISATEURS POUR DIAGRAMMES
  const fetchUserStatistics = useCallback(async () => {
    try {
      const usersResponse = await api.get("/users");
      const allUsers = usersResponse.data;
      
      const stats = {
        total: allUsers.length,
        salarie: allUsers.filter(user => user.role === 'SALARIE').length,
        stagiaire: allUsers.filter(user => user.role === 'STAGIAIRE').length,
        adminRh: allUsers.filter(user => user.role === 'ADMIN_RH').length
      };
      
      setUserStats(stats);
    } catch (error) {
      console.error("Erreur stats utilisateurs:", error);
    }
  }, []);

  // 🔹 STATISTIQUES CONTRATS POUR DIAGRAMMES
  const fetchContratStatistics = useCallback(async () => {
    try {
      const contratsResponse = await api.get("/contrats");
      const allContrats = contratsResponse.data.contrats || contratsResponse.data;
      
      const stats = {
        total: allContrats.length,
        cdi: allContrats.filter(contrat => contrat.typeContrat === 'CDI').length,
        cdd: allContrats.filter(contrat => contrat.typeContrat === 'CDD').length,
        stage: allContrats.filter(contrat => contrat.typeContrat === 'Stage').length,
        interim: allContrats.filter(contrat => contrat.typeContrat === 'Intérim').length,
        autres: allContrats.filter(contrat => 
          !['CDI', 'CDD', 'Stage', 'Intérim'].includes(contrat.typeContrat)
        ).length
      };
      
      setContratStats(stats);
    } catch (error) {
      console.error("Erreur stats contrats:", error);
    }
  }, []);

  // 🔹 STATISTIQUES POUR ADMIN_RH
  const fetchAdminStats = useCallback(async () => {
    try {
      // Récupérer tous les utilisateurs
      const usersResponse = await api.get("/users");
      const allUsers = usersResponse.data;
      
      const totalUsers = allUsers.length;
      const stagiairesCount = allUsers.filter(user => user.role === 'STAGIAIRE').length;

      // Récupérer les congés approuvés - CORRECTION APPLIQUÉE
      let enCongeCount = 0;
      try {
        const congesResponse = await api.get("/conges/admin/tous");
        const tousLesConges = congesResponse.data.conges || congesResponse.data || [];
        
        const congesApprouves = tousLesConges.filter(conge => {
          const estApprouve = conge.statut === 'Approuvé' || conge.statut === 'APPROUVE';
          const estEnCours = new Date(conge.dateFin) >= new Date();
          return estApprouve && estEnCours;
        });
        
        enCongeCount = congesApprouves.length;
        
        console.log("📊 Congés analysés:", {
          totalConges: tousLesConges.length,
          approuves: congesApprouves.length,
          congesApprouves: congesApprouves.map(c => ({
            user: c.user?.prenom + ' ' + c.user?.nom,
            statut: c.statut,
            dateDebut: c.dateDebut,
            dateFin: c.dateFin
          }))
        });
        
      } catch (error) {
        console.log("Chargement congés échoué:", error);
        enCongeCount = 0;
      }

      // Récupérer les contrats actifs
      let contratsCount = 0;
      try {
        const contratsResponse = await api.get("/contrats");
        const allContrats = contratsResponse.data.contrats || contratsResponse.data;
        const contratsActifs = allContrats.filter(contrat => {
          const aujourdHui = new Date();
          const dateFin = contrat.dateFin ? new Date(contrat.dateFin) : null;
          return contrat.statut === "Actif" && (!dateFin || dateFin >= aujourdHui);
        });
        contratsCount = contratsActifs.length;
      } catch (error) {
        console.log("Chargement contrats échoué:", error);
        contratsCount = 0;
      }

      setStats([
        { label: 'Employés total', value: totalUsers.toString(), color: 'bg-blue-500', key: 'totalUsers', icon: '👥' },
        { label: 'Congés en cours', value: enCongeCount.toString(), color: 'bg-orange-500', key: 'enConge', icon: '🏖️' },
        { label: 'Stagiaires', value: stagiairesCount.toString(), color: 'bg-green-500', key: 'stagiaires', icon: '🎓' },
        { label: 'Contrats en cours', value: contratsCount.toString(), color: 'bg-purple-500', key: 'contrats', icon: '📝' },
      ]);

      // Charger les statistiques pour les diagrammes
      await fetchUserStatistics();
      await fetchContratStatistics();

    } catch (error) {
      console.error("Erreur stats admin:", error);
    }
  }, [fetchUserStatistics, fetchContratStatistics]);

 // 🔹 CORRECTION DES SOLDES DE CONGÉS DANS Dashboard.js
const fetchSalarieStats = useCallback(async () => {
  try {
    console.log("🔄 Chargement des stats salarié...");

    const results = {
      mesCongesCount: 0,
      soldeConges: 0,
      mesContratsCount: 0,
      mesAttestationsCount: 0
    };

    // 1. Chargement des congés
    try {
      const congesResponse = await api.get("/conges/mes-conges");
      console.log("📊 Réponse mes-conges:", congesResponse.data);
      
      // Gestion des différentes structures de réponse
      let congesData = [];
      if (congesResponse.data.success !== false) {
        congesData = congesResponse.data.conges || congesResponse.data || [];
      }
      
      results.mesCongesCount = congesData.filter(conge => {
        const estApprouve = conge.statut === 'Approuvé' || conge.statut === 'APPROUVE';
        const estEnCours = new Date(conge.dateFin) >= new Date();
        return estApprouve && estEnCours;
      }).length;
    } catch (error) {
      console.log("❌ Chargement congés:", error.response?.data || error.message);
    }

    // 2. Chargement des soldes - CORRECTION COMPLÈTE
    try {
      const soldesResponse = await api.get("/conges/mes-soldes");
      console.log("💰 Réponse mes-soldes COMPLÈTE:", soldesResponse.data);
      
      const soldesData = soldesResponse.data;
      
      // Gestion de TOUTES les structures possibles
      if (soldesData.success !== false) {
        if (soldesData.soldes) {
          // Structure: { success: true, soldes: { annuel: X, maladie: Y, ... } }
          results.soldeConges = soldesData.soldes.annuel || 0;
        } else if (soldesData.soldesDetails) {
          // Structure: { success: true, soldesDetails: { annuel: { restant: X }, ... } }
          results.soldeConges = soldesData.soldesDetails.annuel?.restant || 0;
        } else if (soldesData.annuel !== undefined) {
          // Structure: { annuel: X, maladie: Y, ... }
          results.soldeConges = soldesData.annuel;
        } else if (typeof soldesData === 'number') {
          // Structure: 25 (nombre direct)
          results.soldeConges = soldesData;
        } else {
          // Structure par défaut
          results.soldeConges = soldesData.solde || 0;
        }
      } else {
        console.log("❌ API soldes retourne success: false");
      }
    } catch (error) {
      console.log("❌ Chargement soldes:", error.response?.data || error.message);
    }

    // 3. Chargement des contrats
    try {
      const contratsResponse = await api.get("/contrats/mes/contrats");
      console.log("📝 Réponse contrats:", contratsResponse.data);
      
      let contratsData = [];
      if (contratsResponse.data.success !== false) {
        contratsData = contratsResponse.data.contrats || contratsResponse.data || [];
      }
      
      results.mesContratsCount = contratsData.filter(contrat => 
        contrat.statut === "Actif"
      ).length;
    } catch (error) {
      console.log("❌ Chargement contrats:", error.response?.data || error.message);
    }

    // 4. Chargement des attestations - CORRECTION APPLIQUÉE
    try {
      const attestationsResponse = await api.get("/attestations/mes-attestations");
      console.log("📄 Réponse attestations:", attestationsResponse.data);
      
      let attestationsData = [];
      if (attestationsResponse.data.success !== false) {
        attestationsData = attestationsResponse.data.attestations || attestationsResponse.data || [];
      }
      
      results.mesAttestationsCount = attestationsData.filter(attestation => 
        attestation.statut === "Générée" || 
        attestation.statut === "Actif" || 
        attestation.statut === "Approuvé" ||
        attestation.statut === "APPROUVE"
      ).length;
    } catch (error) {
      console.log("❌ Chargement attestations:", error.response?.data || error.message);
    }

    console.log("📈 Stats salarié finales:", results);

    setStats([
      { 
        label: 'Congés en cours', 
        value: results.mesCongesCount.toString(), 
        color: 'bg-orange-500', 
        key: 'mesConges', 
        icon: '🏖️' 
      },
      { 
        label: 'Jours congés restants', 
        value: results.soldeConges.toString(), 
        color: 'bg-green-500', 
        key: 'soldeConges', 
        icon: '📊' 
      },
      { 
        label: 'Contrats actifs', 
        value: results.mesContratsCount.toString(), 
        color: 'bg-purple-500', 
        key: 'mesContrats', 
        icon: '📝' 
      },
      { 
        label: 'Attestations', 
        value: results.mesAttestationsCount.toString(), 
        color: 'bg-blue-500', 
        key: 'attestations', 
        icon: '📄' 
      },
    ]);

  } catch (error) {
    console.error("❌ Erreur générale stats salarié:", error);
  }
}, []);

  // 🔹 STATISTIQUES POUR STAGIAIRE (SANS CONTRAT DE STAGE)
  const fetchStagiaireStats = useCallback(async () => {
    try {
      // Mes rapports
      let mesRapportsCount = 0;
      try {
        const rapportsResponse = await api.get("/rapports/mes-rapports");
        mesRapportsCount = rapportsResponse.data.length;
      } catch (error) {
        console.log("Chargement rapports échoué:", error);
      }

      // Eligibility attestation
      let eligibility = "Non";
      try {
        const eligibilityResponse = await api.get("/attestations/stagiaire/eligibility");
        eligibility = eligibilityResponse.data.eligible ? "Oui" : "Non";
      } catch (error) {
        console.log("Chargement eligibility échoué:", error);
      }

      // Calcul des jours restants
      let joursRestants = "0";
      try {
        const stageResponse = await api.get("/stages/mon-stage");
        if (stageResponse.data.success && stageResponse.data.stage) {
          const stage = stageResponse.data.stage;
          if (stage.dateFin) {
            const dateFin = new Date(stage.dateFin);
            const aujourdHui = new Date();
            const diffTime = dateFin - aujourdHui;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            joursRestants = Math.max(0, diffDays).toString();
          }
        }
      } catch (error) {
        console.log("Calcul jours restants échoué:", error);
      }

      // Tâches en cours
      let tachesEnCours = "0";
      try {
        const tachesResponse = await api.get("/taches/mes-taches");
        const tachesData = tachesResponse.data.taches || tachesResponse.data || [];
        tachesEnCours = tachesData.filter(tache => 
          tache.statut === 'EN_COURS' || tache.statut === 'A_FAIRE'
        ).length.toString();
      } catch (error) {
        console.log("Chargement tâches échoué:", error);
      }

      setStats([
        { label: 'Mes rapports', value: mesRapportsCount.toString(), color: 'bg-green-500', key: 'rapports', icon: '📋' },
        { label: 'Éligible attestation', value: eligibility, color: 'bg-blue-500', key: 'eligibility', icon: '✅' },
        { label: 'Jours restants', value: joursRestants, color: 'bg-orange-500', key: 'joursRestants', icon: '📅' },
        { label: 'Tâches en cours', value: tachesEnCours, color: 'bg-purple-500', key: 'taches', icon: '🎯' },
      ]);

    } catch (error) {
      console.error("Erreur stats stagiaire:", error);
    }
  }, []);

  // 🔹 ACTIVITÉS RÉCENTES POUR TOUS
  const fetchRecentActivities = useCallback(async (role) => {
    try {
      let activities = [];

      if (role === 'ADMIN_RH') {
        const usersResponse = await api.get("/users");
        const recentUsers = usersResponse.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);
        
        activities = recentUsers.map(user => ({
          text: `${user.role === 'STAGIAIRE' ? 'Nouveau stagiaire' : 'Nouvel employé'} - ${user.prenom} ${user.nom}`,
          time: `Il y a ${calculateTimeAgo(user.createdAt)}`
        }));

      } else if (role === 'SALARIE') {
        try {
          const congesResponse = await api.get("/conges/mes-conges");
          const congesData = congesResponse.data.conges || congesResponse.data || [];
          const recentConges = congesData
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          
          activities = recentConges.map(conge => ({
            text: `Congé ${conge.statut.toLowerCase()} - ${conge.typeConge || conge.type}`,
            time: `Il y a ${calculateTimeAgo(conge.createdAt)}`
          }));
        } catch (error) {
          console.log("Erreur chargement congés pour activités:", error);
        }

        if (activities.length < 4) {
          activities.push({
            text: 'Contrat en cours - Vérification',
            time: 'Aujourd\'hui'
          });
        }

      } else if (role === 'STAGIAIRE') {
        try {
          const rapportsResponse = await api.get("/rapports/mes-rapports");
          const recentRapports = rapportsResponse.data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          
          activities = recentRapports.map(rapport => ({
            text: `Rapport ${rapport.statut.toLowerCase()} - ${rapport.titre}`,
            time: `Il y a ${calculateTimeAgo(rapport.createdAt)}`
          }));
        } catch (error) {
          console.log("Erreur chargement rapports pour activités:", error);
        }

        if (activities.length < 4) {
          activities.push({
            text: 'Stage en cours - Période active',
            time: 'En cours'
          });
        }
      }

      if (activities.length === 0) {
        activities = [
          { text: 'Système chargé avec succès', time: 'Maintenant' },
          { text: 'Données mises à jour', time: 'Récemment' }
        ];
      }

      setRecentActivities(activities.slice(0, 4));

    } catch (error) {
      console.error("Erreur activités:", error);
      setRecentActivities([
        { text: 'Système chargé avec succès', time: 'Maintenant' },
        { text: 'Données mises à jour', time: 'Récemment' }
      ]);
    }
  }, []);

  // 🔹 ALERTES SPÉCIFIQUES AU RÔLE
  const fetchAlerts = useCallback(async (role) => {
    try {
      let alertsData = [];

      if (role === 'ADMIN_RH') {
        try {
          const congesResponse = await api.get("/conges/admin/tous");
          const tousLesConges = congesResponse.data.conges || congesResponse.data || [];
          const congesEnAttente = tousLesConges.filter(conge => 
            conge.statut === 'En attente' || conge.statut === 'EN_ATTENTE'
          );
          if (congesEnAttente.length > 0) {
            alertsData.push({
              text: `${congesEnAttente.length} demande(s) de congé en attente`,
              type: 'warning',
              action: 'Voir'
            });
          }
        } catch (error) {
          console.log("Chargement alertes congés échoué");
        }

        try {
          const rapportsResponse = await api.get("/rapports");
          const rapportsEnAttente = rapportsResponse.data.filter(rapport => 
            rapport.statut === 'EN_ATTENTE'
          );
          if (rapportsEnAttente.length > 0) {
            alertsData.push({
              text: `${rapportsEnAttente.length} rapport(s) de stage en attente`,
              type: 'info',
              action: 'Voir'
            });
          }
        } catch (error) {
          console.log("Chargement alertes rapports échoué");
        }

      } else if (role === 'SALARIE') {
        try {
          const congesResponse = await api.get("/conges/mes-conges");
          const congesData = congesResponse.data.conges || congesResponse.data || [];
          const congesEnAttente = congesData.filter(conge => 
            conge.statut === 'En attente' || conge.statut === 'EN_ATTENTE'
          );
          if (congesEnAttente.length > 0) {
            alertsData.push({
              text: `${congesEnAttente.length} de vos congés en attente`,
              type: 'warning',
              action: 'Voir'
            });
          }
        } catch (error) {
          console.log("Chargement alertes congés salarié échoué");
        }

      } else if (role === 'STAGIAIRE') {
        try {
          const rapportsResponse = await api.get("/rapports/mes-rapports");
          const rapportsIncomplets = rapportsResponse.data.filter(rapport => 
            rapport.statut === 'BROUILLON' || rapport.statut === 'EN_ATTENTE'
          );
          if (rapportsIncomplets.length > 0) {
            alertsData.push({
              text: `${rapportsIncomplets.length} rapport(s) à compléter`,
              type: 'warning',
              action: 'Voir'
            });
          }
        } catch (error) {
          console.log("Chargement alertes rapports échoué");
        }
      }

      if (alertsData.length === 0) {
        alertsData.push({
          text: 'Tout est à jour !',
          type: 'info',
          action: 'Voir'
        });
      }

      setAlerts(alertsData);

    } catch (error) {
      console.error("Erreur alertes:", error);
      setAlerts([{
        text: 'Système opérationnel',
        type: 'info',
        action: 'OK'
      }]);
    }
  }, []);

  // 🔹 CHARGEMENT PRINCIPAL
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const role = await fetchCurrentUser();
        
        if (!role) {
          console.error("Rôle utilisateur non trouvé");
          return;
        }

        if (role === 'ADMIN_RH') {
          await fetchAdminStats();
        } else if (role === 'SALARIE') {
          await fetchSalarieStats();
        } else if (role === 'STAGIAIRE') {
          await fetchStagiaireStats();
        }

        await fetchRecentActivities(role);
        await fetchAlerts(role);

      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchCurrentUser, fetchAdminStats, fetchSalarieStats, fetchStagiaireStats, fetchRecentActivities, fetchAlerts]);

  const getAlertStyles = (type) => {
    const styles = {
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        button: 'text-yellow-600 hover:text-yellow-700'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        button: 'text-blue-600 hover:text-blue-700'
      }
    };
    return styles[type] || styles.info;
  };

  // Composant pour le diagramme des utilisateurs
  const UserDistributionChart = () => {
    const total = userStats.total || 1;
    const percentages = {
      salarie: (userStats.salarie / total) * 100,
      stagiaire: (userStats.stagiaire / total) * 100,
      adminRh: (userStats.adminRh / total) * 100
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Répartition des Utilisateurs</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">👨‍💼 Salariés</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{userStats.salarie}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${percentages.salarie}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-10">{percentages.salarie.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">🎓 Stagiaires</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{userStats.stagiaire}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${percentages.stagiaire}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-10">{percentages.stagiaire.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">🔧 Admin RH</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{userStats.adminRh}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${percentages.adminRh}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-10">{percentages.adminRh.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">👥 Total utilisateurs</span>
            <span className="font-semibold text-gray-900">{userStats.total}</span>
          </div>
        </div>
      </div>
    );
  };

  // Composant pour le diagramme des contrats
  const ContratTypeChart = () => {
    const total = contratStats.total || 1;
    const types = [
      { label: '📄 CDI', value: contratStats.cdi, color: 'bg-green-500' },
      { label: '📑 CDD', value: contratStats.cdd, color: 'bg-blue-500' },
      { label: '🎓 Stage', value: contratStats.stage, color: 'bg-yellow-500' },
      { label: '⏱️ Intérim', value: contratStats.interim, color: 'bg-orange-500' },
      { label: '📋 Autres', value: contratStats.autres, color: 'bg-gray-500' }
    ];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📑 Types de Contrats</h3>
        <div className="space-y-3">
          {types.map((type, index) => {
            const percentage = total > 0 ? (type.value / total) * 100 : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{type.value}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${type.color}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">📊 Total contrats</span>
            <span className="font-semibold text-gray-900">{contratStats.total}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <span className="text-sm text-gray-500">
            Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
          <span className="ml-3 text-gray-600">Chargement des données...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Tableau de bord {userRole && `- ${userRole === 'ADMIN_RH' ? 'Administration' : userRole === 'SALARIE' ? 'Espace Salarié' : 'Espace Stagiaire'}`}
        </h1>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      </div>

      {/* Cartes de statistiques AVEC ICÔNES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={stat.key}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section diagrammes (uniquement pour ADMIN_RH) */}
      {userRole === 'ADMIN_RH' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserDistributionChart />
          <ContratTypeChart />
        </div>
      )}

      {/* Section activités récentes et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {userRole === 'ADMIN_RH' ? '📈 Activités récentes' : 
             userRole === 'SALARIE' ? '📈 Mes dernières activités' : '📈 Mes rapports récents'}
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 flex-1">{activity.text}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes et rappels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {userRole === 'ADMIN_RH' ? '🔔 Alertes et rappels' : 
             userRole === 'SALARIE' ? '🔔 Mes notifications' : '🔔 Mes alertes'}
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const styles = getAlertStyles(alert.type);
              return (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 ${styles.bg} ${styles.border} rounded-lg`}
                >
                  <span className={`${styles.text} text-sm`}>{alert.text}</span>
                  <button className={`${styles.button} text-sm font-medium transition-colors duration-150`}>
                    {alert.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;