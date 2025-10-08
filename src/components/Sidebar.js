import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
  const menuItems = {
    ADMIN_RH: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/admin/users', label: 'Utilisateurs', icon: '👥' },
      { path: '/admin/contrats', label: 'Contrats', icon: '📝' },
      { path: '/admin/service', label: 'Services', icon: '🏢' },
      { path: '/admin/presence', label: 'Présences', icon: '⏰' },
      { path: '/admin/conges', label: 'Congés', icon: '🌴' },
      { path: '/admin/stage', label: 'Stages', icon: '🎓' },
      { path: '/admin/attestations', label: 'Attestations', icon: '📄' },
      { path: '/admin/rapports', label: 'Rapports', icon: '📈' },
    ],
    SALARIE: [
      { path: '/salarie/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/salarie/profil', label: 'Mon Profil', icon: '👤' },
      { path: '/salarie/conges', label: 'Mes Congés', icon: '🌴' },
      { path: '/salarie/presence', label: 'Mes Présences', icon: '⏰' },
      { path: '/salarie/attestations', label: 'Mes Attestations', icon: '📄' },
      { path: '/salarie/contrats', label: 'Mes Contrats', icon: '📝' },
    ],
    STAGIAIRE: [
      { path: '/stagiaire/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/stagiaire/profil', label: 'Mon Profil', icon: '👤' },
      { path: '/stagiaire/monstage', label: 'Mon Stage', icon: '🎓' },
      { path: '/stagiaire/attestations', label: 'Mes Attestations', icon: '📄' },
      { path: '/stagiaire/rapports', label: 'Mes Rapports', icon: '📝' },
    ]
  };

  const items = menuItems[userRole] || [];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
      </div>
      
      <nav className="px-4 space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;