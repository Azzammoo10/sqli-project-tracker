import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4B2A7B] via-[#5B3A8B] to-[#6B4A9B] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-[#4B2A7B] mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page non trouvée</h1>
          <p className="text-gray-600">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/auth/login"
            className="inline-flex items-center space-x-2 bg-[#4B2A7B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5B3A8B] transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Retour à l'accueil</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 text-[#4B2A7B] hover:text-[#5B3A8B] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour en arrière</span>
          </button>
        </div>
      </div>
    </div>
  );
}
