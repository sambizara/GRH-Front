import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
  const menuItems = {
    ADMIN_RH: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/admin/users', label: 'Utilisateurs', icon: '👥' },
      { path: '/admin/contrats', label: 'Contrats', icon: '📝' },
      { path: '/admin/service', label: 'Services', icon: '🏢' },
      { path: '/admin/conges', label: 'Congés', icon: '🌴' },
      { path: '/admin/stage', label: 'Stages', icon: '🎓' },
      { path: '/admin/attestations', label: 'Attestations', icon: '📄' },
      { path: '/admin/rapports', label: 'Rapports', icon: '📈' },
    ],
    SALARIE: [
      { path: '/salarie/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/salarie/profil', label: 'Mon Profil', icon: '👤' },
      { path: '/salarie/conges', label: 'Mes Congés', icon: '🌴' },
      { path: '/salarie/messtagesencadres', label: 'Mes Stages Encadrés', icon: '⏰' },
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

  // Fonction pour générer les icônes Tailwind
  const getIcon = (iconName, isActive = false) => {
    const iconClass = `w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-600'}`;
    
    switch(iconName) {
      case '📊': // Dashboard
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10" />
          </svg>
        );
      case '👥': // Utilisateurs
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case '📝': // Contrats
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case '🏢': // Services
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-5m0 5h4" />
          </svg>
        );
      case '⏰': // Présences / Stages Encadrés
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case '🌴': // Congés
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case '🎓': // Stages / Mon Stage
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l-9-5m9 5l9-5m-9 5v6" />
          </svg>
        );
      case '📄': // Attestations
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case '📈': // Rapports
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case '👤': // Profil
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return <span className={iconClass}>•</span>;
    }
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
            {({ isActive }) => (
              <>
                {getIcon(item.icon, isActive)}
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;