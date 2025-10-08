import React from 'react';

const TestTailwind = () => {
  return (
    <div className="p-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-4">✅ Tailwind CSS fonctionne !</h1>
        <p className="text-blue-100">Tous les composants sont maintenant stylisés avec Tailwind CSS</p>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-lg">
          ✅ Couleurs
        </div>
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg">
          ✅ Responsive
        </div>
        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg">
          ✅ Composants
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;