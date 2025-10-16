import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Import du logo
import logoSPAT from '../assets/images/logos/logo_spat.jpg';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("🔐 Tentative de connexion avec:", credentials.email);
      
      const result = await login(credentials.email, credentials.password);

      if (result.success) {
        console.log("✅ Connexion réussie via AuthContext");
        
        const redirectPaths = {
          'ADMIN_RH': '/admin/dashboard',
          'SALARIE': '/salarie/dashboard', 
          'STAGIAIRE': '/stagiaire/dashboard'
        };
        
        const redirectPath = redirectPaths[result.user.role] || '/dashboard';
        console.log("🔄 Redirection vers:", redirectPath);
        navigate(redirectPath);
        
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccount = (role) => {
    const demoAccounts = {
      'ADMIN_RH': { email: 'admin@demo.com', password: 'demo123' },
      'SALARIE': { email: 'salarie@demo.com', password: 'demo123' },
      'STAGIAIRE': { email: 'stagiaire@demo.com', password: 'demo123' }
    };

    const { email, password } = demoAccounts[role];
    setCredentials({ email, password });
    setError('');
    
    // Scroll vers le formulaire pour voir les champs remplis
    document.getElementById('email')?.focus();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-center">
          {/* Logo SPAT avec image */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-lg shadow-md">
              <img 
                src={logoSPAT} 
                alt="SPAT - Port Autonome de Toulouse" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  e.target.style.display = 'none';
                  const fallback = e.target.parentNode;
                  fallback.innerHTML = `
                    <div class="text-blue-600 font-bold text-xl">SPAT</div>
                    <div class="text-blue-500 text-xs font-medium mt-1">Port Autonome de Toulouse</div>
                  `;
                }}
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white">GRH System</h1>
          <p className="text-blue-100 mt-2">Connexion à votre espace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="votre@email.com"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              required
              disabled={loading}
            />
          </div>
          
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Votre mot de passe"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Section des comptes de démonstration */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-4 text-center">Comptes de démonstration</p>
          <div className="flex flex-col gap-3">
            <button 
              type="button" 
              onClick={() => handleDemoAccount("ADMIN_RH")} 
              className="flex items-center justify-center px-6 py-4 rounded-full border-2 border-purple-300 transition-all duration-200 hover:shadow-lg hover:border-purple-400 bg-purple-100 text-purple-700 hover:bg-purple-200 transform hover:-translate-y-0.5 font-medium"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin RH
            </button>
            
            <button 
              type="button" 
              onClick={() => handleDemoAccount("SALARIE")} 
              className="flex items-center justify-center px-6 py-4 rounded-full border-2 border-blue-300 transition-all duration-200 hover:shadow-lg hover:border-blue-400 bg-blue-100 text-blue-700 hover:bg-blue-200 transform hover:-translate-y-0.5 font-medium"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Salarié
            </button>
            
            <button 
              type="button" 
              onClick={() => handleDemoAccount("STAGIAIRE")} 
              className="flex items-center justify-center px-6 py-4 rounded-full border-2 border-green-300 transition-all duration-200 hover:shadow-lg hover:border-green-400 bg-green-100 text-green-700 hover:bg-green-200 transform hover:-translate-y-0.5 font-medium"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Stagiaire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;