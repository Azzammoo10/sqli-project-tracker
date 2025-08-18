import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import NavDev from '../../components/NavDev';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

export default function DevDashboard() {
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
        <div className="flex h-screen">
          <NavDev user={user} onLogout={handleLogout} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
              <p className="text-gray-600">Chargement du dashboard...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-gray-50">
        <NavDev user={user} onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Développeur</h1>
            
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Bienvenue dans votre espace Développeur !</p>
              <p className="text-gray-600 mt-2">Ce dashboard sera bientôt enrichi avec vos tâches et planning.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
