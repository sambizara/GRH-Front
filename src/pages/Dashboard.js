import React from 'react';

const Dashboard = () => {
  const stats = [
    { label: 'Employés total', value: '24', color: 'bg-blue-500' },
    { label: 'En congé', value: '3', color: 'bg-orange-500' },
    { label: 'Stagiaires', value: '5', color: 'bg-green-500' },
    { label: 'Contrats en cours', value: '22', color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <span className="text-sm text-gray-500">Aujourd'hui, {new Date().toLocaleDateString('fr-FR')}</span>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{stat.value}</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activités récentes</h2>
          <div className="space-y-4">
            {[
              'Nouveau contrat signé - Marie Dupont',
              'Demande de congé approuvée - Jean Martin',
              'Rapport de stage soumis - Sophie Lambert',
              'Attestation générée - Pierre Moreau'
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{activity}</span>
                <span className="text-xs text-gray-500 ml-auto">Il y a 2h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alertes et rappels</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-800">3 contrats à renouveler ce mois</span>
              <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                Voir
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-800">2 rapports de stage en attente</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Voir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;