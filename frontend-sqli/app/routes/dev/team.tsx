import { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FolderOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavDev from '../../components/NavDev';
import { authService } from '../../services/api';
import { projectService, type Project } from '../../services/projectService';
import toast from 'react-hot-toast';

interface TeamMember {
  id: number;
  username: string;
  email: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  projects: Project[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionRate: number;
}

export default function DevTeam() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => { loadTeamData(); }, []);

  useEffect(() => {
    let filtered = teamMembers;
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (departmentFilter) {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }
    setFilteredMembers(filtered);
  }, [teamMembers, searchTerm, departmentFilter]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      // Récupérer les projets du développeur
      const userProjects = await projectService.getProjectsForCurrentUser();
      
      // Extraire tous les développeurs uniques des projets
      const allDevelopers = new Map<number, TeamMember>();
      
      userProjects.forEach(project => {
        if (project.developpeurs) {
          project.developpeurs.forEach(dev => {
            if (dev.id !== userData.id) { // Exclure l'utilisateur actuel
              if (!allDevelopers.has(dev.id)) {
                allDevelopers.set(dev.id, {
                  id: dev.id,
                  username: dev.username,
                  email: dev.email,
                  jobTitle: 'Développeur',
                  department: 'IT',
                  phone: '',
                  projects: [],
                  totalTasks: 0,
                  completedTasks: 0,
                  inProgressTasks: 0,
                  blockedTasks: 0,
                  completionRate: 0
                });
              }
              allDevelopers.get(dev.id)!.projects.push(project);
            }
          });
        }
      });
      
      // Calculer les statistiques pour chaque membre
      const membersWithStats = Array.from(allDevelopers.values()).map(member => {
        const totalTasks = member.projects.reduce((sum, project) => sum + (project.totalTasks || 0), 0);
        const completedTasks = member.projects.reduce((sum, project) => sum + (project.completedTasks || 0), 0);
        const inProgressTasks = member.projects.reduce((sum, project) => sum + (project.inProgressTasks || 0), 0);
        const blockedTasks = totalTasks - completedTasks - inProgressTasks;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          ...member,
          totalTasks,
          completedTasks,
          inProgressTasks,
          blockedTasks,
          completionRate
        };
      });
      
      setTeamMembers(membersWithStats);
      setFilteredMembers(membersWithStats);
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement de l\'équipe:', error);
      toast.error(`Erreur lors du chargement de l'équipe: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCompletionRateIcon = (rate: number) => {
    if (rate >= 80) return <CheckCircle className="w-4 h-4" />;
    if (rate >= 60) return <TrendingUp className="w-4 h-4" />;
    if (rate >= 40) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
        <div className="flex h-screen bg-gray-50">
          <NavDev user={user} onLogout={() => {}} />
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
        <NavDev user={user} onLogout={() => {}} />

        <main className="flex-1 overflow-auto">
          {/* Banner harmonisée */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mon Équipe</h1>
                    <p className="text-white/90 text-lg">Développeurs travaillant sur vos projets</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                    {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pb-8">
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-gray-800 w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-800"
                  >
                    <option value="">Tous les départements</option>
                    <option value="IT">IT</option>
                    <option value="DEV">Développement</option>
                    <option value="QA">Qualité</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liste des membres */}
            {filteredMembers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    {/* En-tête du membre */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.username}</h3>
                        <p className="text-sm text-gray-600 mb-2">{member.jobTitle || 'Développeur'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span>{member.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {member.department || 'IT'}
                        </span>
                      </div>
                    </div>

                    {/* Projets en commun */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        Projets en commun ({member.projects.length})
                      </h4>
                      <div className="space-y-1">
                        {member.projects.slice(0, 3).map((project) => (
                          <div key={project.id} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {project.titre}
                          </div>
                        ))}
                        {member.projects.length > 3 && (
                          <div className="text-xs text-gray-500 italic">
                            +{member.projects.length - 3} autre(s) projet(s)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Statistiques des tâches */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{member.totalTasks}</div>
                        <div className="text-xs text-gray-600">Total tâches</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{member.completedTasks}</div>
                        <div className="text-xs text-gray-600">Terminées</div>
                      </div>
                    </div>

                    {/* Taux de completion */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux de completion</span>
                      <div className={`flex items-center gap-1 font-medium ${getCompletionRateColor(member.completionRate)}`}>
                        {getCompletionRateIcon(member.completionRate)}
                        <span>{member.completionRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || departmentFilter ? 'Aucun membre trouvé' : 'Aucun membre d\'équipe'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || departmentFilter
                    ? 'Essayez de modifier vos filtres de recherche'
                    : "Vous travaillez seul sur vos projets pour le moment"}
                </p>
                {(searchTerm || departmentFilter) && (
                  <button
                    onClick={() => { setSearchTerm(''); setDepartmentFilter(''); }}
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
