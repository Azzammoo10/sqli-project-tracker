import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FolderOpen,
  Users,
    FileText,
  Activity,
  Clock,
    TrendingUp,
  UserCheck,
    UserX,
} from 'lucide-react';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import DatabaseRepair from '../../components/DatabaseRepair';
import { authService } from '~/services/api';
import { userService } from '~/services/userService';
import { projectService } from '~/services/projectService';
import { historyService, type HistoryEntry } from '~/services/historyService';
import { contactService, type ContactStats } from '~/services/contactService';
import toast from 'react-hot-toast';

type UserLite = {
  id: number;
  username: string;
  email: string;
    role: 'ADMIN' | 'CHEF_DE_PROJET' | 'DEVELOPPEUR' | 'CLIENT' | 'STAGIAIRE';
  actif?: boolean;
    nom?: string;
    prenom?: string;
    department?: 'ADMINISTRATION' | 'DEVELOPPEMENT' | 'EXTERNE' | 'MANAGEMENT';
    jobTitle?: string;
    enabled?: boolean;
};

type ProjectStats = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  lateProjects?: number;
};

interface DashboardData {
    users: UserLite[];
    projects: any[];
    projectStats: ProjectStats | null;
    contactStats: ContactStats | null;
    recentLogs: HistoryEntry[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        users: [],
        projects: [],
        projectStats: null,
        contactStats: null,
        recentLogs: [],
    });

    // Charger toutes les données du dashboard
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                userData,
                usersList,
                projectsList,
                projectStatsData,
                contactStatsData,
                historyData,
            ] = await Promise.all([
          authService.getCurrentUser(),
          userService.getAllUsers(),
                projectService.getAllProjects(),
          projectService.getProjectStats(),
                contactService.getContactStats(),
          historyService.getAllHistory(),
        ]);

            setMe(userData);

            // Trier les logs du plus récent au plus ancien
            const sortedLogs = (Array.isArray(historyData) ? historyData : [])
          .slice()
          .sort((a, b) => new Date(b.dateHeure).getTime() - new Date(a.dateHeure).getTime());

            setDashboardData({
                users: usersList as unknown as UserLite[],
                projects: projectsList || [],
                projectStats: projectStatsData as ProjectStats,
                contactStats: contactStatsData,
                recentLogs: sortedLogs.slice(0, 4), // 4 dernières actions seulement
            });

            // Debug logs pour diagnostiquer
            console.log('🔍 Debug Dashboard Data:');
            console.log('Users:', usersList);
            console.log('Contact Stats:', contactStatsData);
            console.log('Recent Logs:', sortedLogs.slice(0, 4));
            console.log('Users actifs/inactifs:', {
                total: usersList?.length || 0,
                actifs: usersList?.filter((u: any) => u.enabled === true).length || 0,
                inactifs: usersList?.filter((u: any) => u.enabled === false).length || 0
            });
            
            // Debug spécifique pour les réclamations
            console.log('📊 Debug Réclamations:');
            console.log('Contact Stats brutes:', contactStatsData);
            console.log('Type contactStats:', typeof contactStatsData);
            console.log('Total réclamations:', contactStatsData?.total);
            console.log('Non traitées:', contactStatsData?.nonTraitees);
      } catch (e: any) {
            console.error('Erreur lors du chargement des données:', e);
            setError('Erreur lors du chargement des données du dashboard');
        toast.error('Erreur lors du chargement des données');
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

    // Calculs des statistiques
    const userStats = useMemo(() => {
        const totalUsers = dashboardData.users.length;
        const activeUsers = dashboardData.users.filter(u => u.enabled === true).length; // Utiliser enabled
        const inactiveUsers = dashboardData.users.filter(u => u.enabled === false).length; // Utiliser enabled
        return { totalUsers, activeUsers, inactiveUsers };
    }, [dashboardData.users]);

        // Statistiques des événements logs des dernières 24h
    const logs24h = useMemo(() => {
        if (!dashboardData.recentLogs || dashboardData.recentLogs.length === 0) return 0;
        
        const now = new Date();
        const cutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        const logs24hCount = dashboardData.recentLogs.filter(log => {
            try {
                const logDate = new Date(log.dateHeure);
                return logDate >= cutoff;
            } catch (error) {
                console.error('Erreur parsing date:', log.dateHeure, error);
                return false;
            }
        }).length;
        
        console.log('📊 Logs 24h calcul:', {
            total: dashboardData.recentLogs.length,
            cutoff: cutoff.toISOString(),
            logs24h: logs24hCount
        });
        
        return logs24hCount;
    }, [dashboardData.recentLogs]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavAdmin user={me} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B2A7B] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

    if (error) {
        return (
            <div className="flex h-screen">
                <NavAdmin user={me} onLogout={handleLogout} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={loadDashboardData}
                            className="px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#3D2B66] transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="flex h-screen bg-gray-50">
        <NavAdmin user={me} onLogout={handleLogout} />

        <div className="flex-1 overflow-auto">
                    {/* Header harmonisé avec les autres pages admin */}
          <div className="p-6">
              <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrateur</h1>
                                        <p className="text-white/90 text-lg">Vue d'ensemble complète du système</p>
                  </div>
                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="text-right text-white/90">
                                        <div className="text-sm">Connecté en tant que</div>
                                        <div className="font-semibold">{me?.username}</div>
                                        <div className="text-xs">{new Date().toLocaleTimeString('fr-FR')}</div>
                                    </div>

                                    

                </div>
              </div>
            </div>
          </div>

                    {/* Contenu principal */}
                    <div className="p-6 space-y-6">
                        {/* KPI Cards - Design professionnel moderne */}
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Projets */}
                            <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Projets</p>
                                        <p className="text-4xl font-bold text-gray-900 mt-2">
                                            {dashboardData.projectStats?.totalProjects ?? 0}
                                        </p>
                                        <div className="flex items-center mt-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-medium text-blue-700">
                                                {dashboardData.projectStats?.activeProjects ?? 0} actifs
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <FolderOpen className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Total Utilisateurs */}
                            <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Utilisateurs</p>
                                        <p className="text-4xl font-bold text-gray-900 mt-2">{userStats.totalUsers}</p>
                                        <div className="flex items-center space-x-3 mt-3">
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                <span className="text-sm font-medium text-green-700">{userStats.activeUsers} actifs</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                                <span className="text-sm font-medium text-red-700">{userStats.inactiveUsers} inactifs</span>
                    </div>
                    </div>
                  </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

                            {/* Total Réclamations */}
                            <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Réclamations</p>
                                        <p className="text-4xl font-bold text-gray-900 mt-2">
                                            {dashboardData.contactStats?.total ?? 0}
                                        </p>
                                        <div className="flex items-center mt-3">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-medium text-orange-700">
                                                {dashboardData.contactStats?.nonTraitees ?? 0} en attente
                                            </p>
                    </div>
                  </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

                            {/* Logs 24h */}
                            <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Logs (24h)</p>
                                        <p className="text-4xl font-bold text-gray-900 mt-2">{logs24h}</p>
                                        <div className="flex items-center mt-3">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-medium text-purple-700">Actions enregistrées</p>
                    </div>
                  </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </section>

                        {/* Contenu en 2 colonnes */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Logs récents - Limité à 4 */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
                                    <p className="text-sm text-gray-600">4 dernières actions</p>
                                </div>
                                <div className="p-6">
                                    {dashboardData.recentLogs.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-sm">Aucune activité</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {dashboardData.recentLogs.slice(0, 4).map((log, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-[#4B2A7B] rounded-full mt-2 flex-shrink-0"></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {log.action}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {log.entityName} #{log.entityId}
                                                            </span>
              </div>
                                                        <p className="text-sm text-gray-600 line-clamp-1">
                                                            {log.description || `${log.action} ${log.entityName}`}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(log.dateHeure).toLocaleString('fr-FR')}
                                                            {log.userUsername && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{log.userUsername}</span>
                                                                </>
                                                            )}
                  </div>
                  </div>
                  </div>
                                            ))}
                  </div>
                                    )}
              </div>
              </div>

                            {/* Top Utilisateurs - Limité à 4 */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Top Utilisateurs</h3>
                                    <p className="text-sm text-gray-600">4 utilisateurs prioritaires</p>
                                </div>
                                <div className="p-6">
                                    {dashboardData.users.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-sm">Aucun utilisateur</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {dashboardData.users
                                                .sort((a, b) => {
                                                    const rolePriority = { ADMIN: 1, CHEF_DE_PROJET: 2, DEVELOPPEUR: 3, CLIENT: 4, STAGIAIRE: 5 };
                                                    // Trier d'abord par statut (actifs en premier), puis par rôle
                                                    if (a.enabled !== b.enabled) {
                                                        return b.enabled ? 1 : -1; // Actifs en premier
                                                    }
                                                    return (rolePriority[a.role] || 6) - (rolePriority[b.role] || 6);
                                                })
                                                .slice(0, 4)
                                                .map((user) => (
                                                    <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-[#4B2A7B] text-white rounded-full flex items-center justify-center font-medium text-sm">
                                                            {(user.nom?.[0] || user.username[0]).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                    {user.nom || user.username}
                                                                </h4>
                                                                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    user.enabled === true 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.enabled === true ? (
                                                        <UserCheck className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <UserX className="h-3 w-3 mr-1" />
                                                    )}
                                                    {user.enabled === true ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                                                            <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="font-medium">{user.role}</span>
                                                                {user.department && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{user.department}</span>
                                                                    </>
                                                                )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
                                </div>
                            </div>
                        </div>

                        {/* Projets récents - Limité à 4 */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Projets récents</h3>
                                <p className="text-sm text-gray-600">4 projets avec progression</p>
                            </div>
                            <div className="p-6">
                                {dashboardData.projects.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">Aucun projet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {dashboardData.projects.slice(0, 4).map((project) => (
                                            <div key={project.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                                        {project.titre}
                                                    </h4>
                                                    <span className="text-lg font-bold text-[#4B2A7B]">
                                                        {Math.round(project.progression || 0)}%
                                                    </span>
                                                </div>
                                                
                                                {/* Barre de progression */}
                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${project.progression || 0}%`,
                                                            backgroundColor: '#4B2A7B',
                                                        }}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium">Type:</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            project.type === 'TMA' ? 'bg-purple-100 text-purple-800' :
                                                            project.type === 'Delivery' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-orange-100 text-orange-800'
                                                        }`}>
                                                            {project.type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium">Statut:</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            project.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                                                            project.statut === 'TERMINE' ? 'bg-green-100 text-green-800' :
                                                            project.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {project.statut}
                                                        </span>
                                                    </div>
                                                    {project.client && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">Client:</span>
                                                            <span>{project.client.nom || project.client.username}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Réparation de la base de données (temporaire) */}
                        <div className="mt-6">
                            <DatabaseRepair />
                        </div>

                        {/* Footer info */}
                        <div className="text-center text-sm text-gray-500 py-4">
                            <p>Dashboard mis à jour — {new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}