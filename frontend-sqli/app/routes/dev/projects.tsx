import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import NavDev from '../../components/NavDev';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import { projectService, type Project } from '../../services/projectService';
import ProjectsTable from '../../components/ProjectsTable';
import toast from 'react-hot-toast';

export default function DevProjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        const devProjects = await projectService.getProjectsByDeveloper();
        setProjects(devProjects);
        console.log('Projects loaded for developer:', devProjects);
      } catch (error: any) {
        console.error('Erreur lors du chargement des projets:', error);
        toast.error('Erreur lors du chargement des projets');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
        <NavDev user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des projets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
      <div className="flex h-screen bg-gray-50">
        <NavDev user={user} onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mes Projets Assignés</h1>
              <p className="text-gray-600">Consultez les projets sur lesquels vous travaillez</p>
            </div>

            <ProjectsTable
              projects={projects}
              userRole="DEVELOPPEUR"
              loading={loading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
