import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Clock,
  Target,
  RefreshCw,
  User
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavDev from '../../components/NavDev';
import { authService } from '../../services/api';
import { projectService } from '../../services/projectService';
import toast from 'react-hot-toast';

interface TeamMember {
  id: number;
  username: string;
  email: string;
  role: string;
  jobTitle?: string;
  department?: string;
  assignedProjects: number;
  completedTasks: number;
  pendingTasks: number;
  availability: number;
  lastActivity: string;
  currentProject?: string;
  sharedProjects?: string[];
}

export default function DevTeam() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      const userData = await authService.getCurrentUser();
      setUser(userData);

      // Charger mes projets pour identifier l'équipe
      const userProjects = await projectService.getProjectsForCurrentUser();
      setMyProjects(userProjects);

      // Pour l'instant, simuler les données d'équipe
      // TODO: Implémenter l'endpoint pour récupérer les vrais membres d'équipe
      const mockTeamMembers: TeamMember[] = [
        {
          id: 1,
          username: 'Alice Martin',
          email: 'alice.martin@sqli.com',
          role: 'DEVELOPPEUR',
          jobTitle: 'Développeur Senior',
          department: 'IT',
          assignedProjects: 2,
          completedTasks: 15,
          pendingTasks: 3,
          availability: 85,
          lastActivity: '2024-01-15T10:30:00',
          currentProject: 'Plateforme E-commerce',
          sharedProjects: ['Plateforme E-commerce', 'API Mobile']
        },
        {
          id: 2,
          username: 'Bob Dupont',
          email: 'bob.dupont@sqli.com',
          role: 'DEVELOPPEUR',
          jobTitle: 'Développeur Full Stack',
          department: 'IT',
          assignedProjects: 3,
          completedTasks: 12,
          pendingTasks: 5,
          availability: 70,
          lastActivity: '2024-01-15T09:15:00',
          currentProject: 'API Mobile',
          sharedProjects: ['API Mobile', 'Dashboard Analytics']
        },
        {
          id: 3,
          username: 'Charlie Wilson',
          email: 'charlie.wilson@sqli.com',
          role: 'DEVELOPPEUR',
          jobTitle: 'Développeur Frontend',
          department: 'IT',
          assignedProjects: 1,
          completedTasks: 8,
          pendingTasks: 4,
          availability: 90,
          lastActivity: '2024-01-15T11:45:00',
          currentProject: 'Dashboard Analytics',
          sharedProjects: ['Dashboard Analytics']
        },
        {
          id: 4,
          username: 'Diana Chen',
          email: 'diana.chen@sqli.com',
          role: 'CHEF_DE_PROJET',
          jobTitle: 'Chef de Projet IT',
          department: 'Management',
          assignedProjects: 5,
          completedTasks: 25,
          pendingTasks: 8,
          availability: 95,
          lastActivity: '2024-01-15T12:00:00',
          currentProject: 'Supervision Projets',
          sharedProjects: ['Plateforme E-commerce', 'API Mobile', 'Dashboard Analytics']
        }
      ];

      setTeamMembers(mockTeamMembers);

    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'équipe:', error);
      toast.error('Erreur lors du chargement des données d\'équipe');
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

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return 'text-green-600 bg-green-100';
    if (availability >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CHEF_DE_PROJET': return 'bg-purple-100 text-purple-800';
      case 'DEVELOPPEUR': return 'bg-blue-100 text-blue-800';
      case 'CLIENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
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
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Équipe</h1>
                <p className="text-sm text-gray-600">
                  Collaborateurs travaillant sur vos projets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadTeamData}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Membres d'équipe</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Projets partagés</p>
                    <p className="text-2xl font-bold text-gray-900">{myProjects.length}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tâches en cours</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamMembers.reduce((sum, member) => sum + member.pendingTasks, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Disponibilité moy.</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(teamMembers.reduce((sum, member) => sum + member.availability, 0) / teamMembers.length)}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                          {member.username.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.username}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role === 'CHEF_DE_PROJET' ? 'Chef de Projet' : 
                             member.role === 'DEVELOPPEUR' ? 'Développeur' : member.role}
                          </span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(member.availability)}`}>
                        {member.availability}%
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.jobTitle && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{member.jobTitle}</span>
                        </div>
                      )}
                      {member.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{member.department}</span>
                        </div>
                      )}
                    </div>

                    {/* Current Activity */}
                    {member.currentProject && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="w-4 h-4 text-[#4B2A7B]" />
                          <span className="font-medium text-[#4B2A7B]">Projet actuel:</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{member.currentProject}</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{member.assignedProjects}</p>
                        <p className="text-xs text-gray-600">Projets</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">{member.completedTasks}</p>
                        <p className="text-xs text-gray-600">Terminées</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">{member.pendingTasks}</p>
                        <p className="text-xs text-gray-600">En cours</p>
                      </div>
                    </div>

                    {/* Shared Projects */}
                    {member.sharedProjects && member.sharedProjects.length > 0 && (
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Projets partagés:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.sharedProjects.slice(0, 2).map((project, index) => (
                            <span key={index} className="inline-block px-2 py-1 bg-[#4B2A7B]/10 text-[#4B2A7B] rounded text-xs">
                              {project}
                            </span>
                          ))}
                          {member.sharedProjects.length > 2 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{member.sharedProjects.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Last Activity */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Dernière activité: {formatLastActivity(member.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre d'équipe</h3>
                <p className="text-gray-600">
                  Vous travaillez seul pour le moment ou aucune donnée d'équipe n'est disponible.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
