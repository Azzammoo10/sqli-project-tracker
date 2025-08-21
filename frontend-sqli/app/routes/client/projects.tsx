// app/routes/client/projects.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Search, Filter, Calendar, Users, Target } from 'lucide-react';
import NavClient from '../../components/NavClient';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import { clientService, type ClientProject } from '../../services/clientService';
import toast from 'react-hot-toast';

export default function ClientProjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);

        const clientProjects = await clientService.getClientProjects();
        setProjects(clientProjects);
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

  // Filtrage des projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.statut === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-green-100 text-green-800 border-green-200';
      case 'TERMINE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ANNULE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return '🔄';
      case 'TERMINE': return '✅';
      case 'EN_ATTENTE': return '⏳';
      case 'ANNULE': return '❌';
      default: return '📋';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULE': return 'Annulé';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TMA': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Interne': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <NavClient user={user} onLogout={handleLogout} />
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
    <ProtectedRoute allowedRoles={['CLIENT']}>
      <div className="flex h-screen bg-gray-50">
        <NavClient user={user} onLogout={handleLogout} />

        <div className="flex-1 overflow-auto">
          {/* Bannière */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mes Projets</h1>
                    <p className="text-white/90 text-lg">Suivi détaillé de vos projets</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                    Total: <b>{projects.length}</b>
                  </span>
                  <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                    Affichés: <b>{filteredProjects.length}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-8">
            {/* Filtres et recherche */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Recherche */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un projet..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                {/* Filtre par statut */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-900"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                </div>

                {/* Filtre par type */}
                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-900"
                  >
                    <option value="all">Tous les types</option>
                    <option value="Delivery">Delivery</option>
                    <option value="TMA">TMA</option>
                    <option value="Interne">Interne</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liste des projets */}
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Essayez de modifier vos filtres de recherche.' 
                    : 'Vous n\'avez pas encore de projets assignés.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* En-tête du projet */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">{project.titre}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
                              {getStatusIcon(project.statut)} {getStatusLabel(project.statut)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(project.type)}`}>
                              {project.type}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{project.description}</p>
                          
                          {/* Métriques rapides */}
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Début: {formatDate(project.dateDebut)}</span>
                            </div>
                            {project.dateFin && (
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                <span>Fin: {formatDate(project.dateFin)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{project.developpeurs?.length || 0} développeur{(project.developpeurs?.length || 0) > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progression */}
                    <div className="px-6 py-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progression</span>
                        <span className="text-sm font-bold text-gray-900">{Math.round(project.progression)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            project.progression >= 100 ? 'bg-green-500' : 'bg-[#4B2A7B]'
                          }`}
                          style={{ width: `${Math.min(project.progression, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Statistiques des tâches */}
                    {project.totalTasks !== undefined && (
                      <div className="px-6 py-4 bg-white border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{project.totalTasks}</p>
                            <p className="text-xs text-gray-500">Total tâches</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{project.completedTasks || 0}</p>
                            <p className="text-xs text-gray-500">Terminées</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{project.inProgressTasks || 0}</p>
                            <p className="text-xs text-gray-500">En cours</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{project.overdueTasks || 0}</p>
                            <p className="text-xs text-gray-500">En retard</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
