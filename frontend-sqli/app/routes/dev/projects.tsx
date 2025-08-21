import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavDev from '../../components/NavDev';
import { authService } from '../../services/api';
import { projectService, type Project } from '../../services/projectService';
import toast from 'react-hot-toast';

export default function DevProjects() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadProjects(); }, []);

  useEffect(() => {
    let filtered = projects;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter) filtered = filtered.filter(p => p.statut === statusFilter);
    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('🔍 Chargement des projets pour le développeur...');
      
      const userData = await authService.getCurrentUser();
      console.log('👤 Utilisateur connecté:', userData);
      setUser(userData);
      
      const userProjects = await projectService.getProjectsForCurrentUser();
      console.log('📋 Projets récupérés:', userProjects);
      
      setProjects(userProjects);
      setFilteredProjects(userProjects);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des projets:', error);
      console.error('❌ Détails de l\'erreur:', error.response?.data);
      console.error('❌ Status de l\'erreur:', error.response?.status);
      toast.error(`Erreur lors du chargement des projets: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TERMINE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BLOQUE': return 'bg-red-100 text-red-800 border-red-200';
      case 'PLANIFIE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EN_COURS': return <Clock className="w-4 h-4" />;
      case 'TERMINE': return <CheckCircle className="w-4 h-4" />;
      case 'BLOQUE': return <AlertTriangle className="w-4 h-4" />;
      case 'PLANIFIE': return <Calendar className="w-4 h-4" />;
      default: return <FolderOpen className="w-4 h-4" />;
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Non définie';

  const isOverdue = (dateFin: string, statut: string) => {
    if (statut === 'TERMINE') return false;
    if (!dateFin) return false;
    return new Date(dateFin) < new Date();
  };

  // Calculer la taille de l'équipe basée sur les développeurs assignés
  const getTeamSize = (project: Project) => {
    return project.developpeurs ? project.developpeurs.length : 0;
  };

  // Obtenir la date de dernière mise à jour (utiliser la date de création si pas de mise à jour)
  const getLastUpdated = (project: Project) => {
    return project.dateDebut || new Date().toISOString();
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
        <div className="flex h-screen bg-gray-50">
          <NavDev user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
      <div className="flex h-screen bg-gray-50">
        <NavDev user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto">
          {/* Banner harmonisée */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mes Projets</h1>
                    <p className="text-white/90 text-lg">Projets auxquels vous êtes assigné</p>
                  </div>
                </div>
                <button
                  onClick={loadProjects}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
                  title="Actualiser"
                >
                  <RefreshCw className="w-4 h-4" /> Actualiser
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pb-8">
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="not-first:w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-gray-800 w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-800"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PLANIFIE">Planifié</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="BLOQUE">Bloqué</option>
                    <option value="TERMINE">Terminé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liste projets */}
            {filteredProjects.length > 0 ? (
              <div className="space-y-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                      isOverdue(project.dateFin || '', project.statut) ? 'border-l-4 border-l-red-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{project.titre}</h3>
                          {isOverdue(project.dateFin || '', project.statut) && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              En retard
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{project.description || 'Aucune description'}</p>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Échéance: {formatDate(project.dateFin)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Équipe: {getTeamSize(project)} membres</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
                          {project.statut}
                        </span>
                      </div>
                    </div>

                    {/* Progression */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-medium">{project.progression || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            (project.progression || 0) >= 100 ? 'bg-green-500' : 'bg-[#4B2A7B]'
                          }`}
                          style={{ width: `${Math.min(project.progression || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats rapides */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-[#4B2A7B] mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Tâches</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{project.totalTasks || 0}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Terminées</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{project.completedTasks || 0}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">En cours</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{project.inProgressTasks || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.statut)}
                        <span className="text-sm text-gray-600">
                          Dernière mise à jour: {formatDate(getLastUpdated(project))}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/dev/tasks?project=${project.id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors"
                      >
                        Voir les tâches
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter ? 'Aucun projet trouvé' : 'Aucun projet assigné'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter
                    ? 'Essayez de modifier vos filtres de recherche'
                    : "Vous n'êtes pas encore assigné à des projets"}
                </p>
                {(searchTerm || statusFilter) && (
                  <button
                    onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                    className="mt-4 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}