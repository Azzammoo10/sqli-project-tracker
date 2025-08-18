import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { authService } from '../../services/api';
import ProtectedRoute from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const DashboardContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement du dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#4B2A7B] text-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Espace Client</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Bienvenue, {user?.username || 'Client'}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-[#4B2A7B] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Client</h2>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Bienvenue dans votre espace Client !</p>
            <p className="text-gray-600 mt-2">Ce dashboard sera bientôt enrichi avec vos projets et leur avancement.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['CLIENT']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
