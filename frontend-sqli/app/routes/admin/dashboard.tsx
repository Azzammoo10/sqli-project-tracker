import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  FolderOpen, 
  Activity,
  BarChart3,
  Clock,
  UserCheck,
  Settings
} from 'lucide-react';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        console.log('Admin user data loaded:', userData);
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

    if (loading) {
      return (
        <div className="flex h-screen">
          <NavAdmin user={user} onLogout={handleLogout} />
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
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gray-50">
        <NavAdmin user={user} onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Bienvenue dans votre espace Administrateur !</p>
            </div>
            
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#4B2A7B] rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Welcome {user?.username?.toUpperCase()} 👋
                  </h2>
                  <p className="text-gray-600">
                    Gestion centralisée des projets, tâches et utilisateurs en un coup d'oeil
                  </p>
                </div>
              </div>
            </div>
            
            {/* KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Projets */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projets</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">8 projets actifs</span>
                    </div>
                  </div>
                  <FolderOpen className="h-8 w-8 text-[#4B2A7B]" />
                </div>
              </div>

              {/* Total Users */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">45</p>
                    <div className="flex items-center mt-2">
                      <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">42 actifs</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-[#4B2A7B]" />
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Activité récente</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                    <div className="flex items-center mt-2">
                      <Clock className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-600">Actions enregistrées</span>
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-[#4B2A7B]" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#4B2A7B] hover:bg-[#4B2A7B]/5 transition-colors text-center"
                >
                  <Users className="h-8 w-8 text-[#4B2A7B] mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Gérer Users</span>
                </button>
                
                <button
                  onClick={() => navigate('/admin/projects')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#4B2A7B] hover:bg-[#4B2A7B]/5 transition-colors text-center"
                >
                  <FolderOpen className="h-8 w-8 text-[#4B2A7B] mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Gérer Projets</span>
                </button>
                
                <button
                  onClick={() => navigate('/admin/history')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#4B2A7B] hover:bg-[#4B2A7B]/5 transition-colors text-center"
                >
                  <BarChart3 className="h-8 w-8 text-[#4B2A7B] mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Historique</span>
                </button>
                
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#4B2A7B] hover:bg-[#4B2A7B]/5 transition-colors text-center"
                >
                  <Settings className="h-8 w-8 text-[#4B2A7B] mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Paramètres</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-[#4B2A7B] rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Nouveau projet créé - Application Mobile
                    </p>
                    <p className="text-xs text-gray-600">
                      Projet • Il y a 2 heures
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-[#4B2A7B] rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Utilisateur ajouté - john.dev@company.com
                    </p>
                    <p className="text-xs text-gray-600">
                      User • Il y a 4 heures
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-[#4B2A7B] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                      Projet terminé - Site Web E-commerce
                      </p>
                      <p className="text-xs text-gray-600">
                      Projet • Il y a 1 jour
                      </p>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
