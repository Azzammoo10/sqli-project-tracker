import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Users, CheckCircle2, PauseCircle, XCircle, Search, RotateCcw,
  Calendar, Clock, Target, Filter, MoreHorizontal, Mail, Phone, MapPin,
  ChevronDown, ChevronUp, Eye, TrendingUp
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '~/services/api';
import { chefDashboardService } from '~/services/chefDashboardService';
import toast from 'react-hot-toast';
import {useNavigate} from "react-router-dom";

interface TeamMember {
  id: number;
  username: string;
  email: string;
  role: string;
  jobTitle: string;
  department: string;
  phone?: string;
  enabled: boolean;
  actifDansProjet: boolean;
  assignedProjects: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  nonCommenceTasks: number;
  totalTasks: number;
  completionRate: number;
  availability: number;
  workload: number;
  lastActivity: string;
  projects: Array<{
    id: number;
    titre: string;
    progression: number;
    statut: string;
    dateDebut?: string;
    dateFin?: string;
  }>;
}

type SortField = 'username' | 'completionRate' | 'workload' | 'assignedProjects';
type SortOrder = 'asc' | 'desc';







export default function ChefTeam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        
        const teamData = await chefDashboardService.getDetailedTeamOverview();
        
        const transformedTeam = teamData.map((member: any) => {
          // Calcul correct de la charge de travail
          const totalTasks = member.totalTasks || 0;
          const inProgressTasks = member.pendingTasks || 0;
          const blockedTasks = member.blockedTasks || 0;
          
          // Charge = (tâches en cours + bloquées) / total * 100
          const workload = totalTasks > 0 ? Math.round(((inProgressTasks + blockedTasks) * 100.0) / totalTasks) : 0;
          
          // Disponibilité = 100 - charge
          const availability = 100 - workload;
          
          return {
            id: member.id,
            username: member.username,
            email: member.email,
            role: member.role,
            jobTitle: member.jobTitle || 'Développeur',
            department: member.department || 'Développement',
            phone: member.phone,
            enabled: member.enabled,
            actifDansProjet: member.actifDansProjet,
            assignedProjects: member.assignedProjects || 0,
            completedTasks: member.completedTasks || 0,
            pendingTasks: member.pendingTasks || 0,
            blockedTasks: member.blockedTasks || 0,
            nonCommenceTasks: member.nonCommenceTasks || 0,
            totalTasks: totalTasks,
            completionRate: member.completionRate || 0,
            availability: availability,
            workload: workload,
            lastActivity: member.lastActivity || 'N/A',
            projects: member.projects || []
          };
        });
        
        setTeam(transformedTeam);
      } catch (e) {
        console.error('Erreur lors du chargement de l\'équipe:', e);
        toast.error("Erreur lors du chargement de l'équipe");
      } finally {
        setLoading(false);
      }
    };
    loadTeamData();
  }, []);

  // Filtrage et tri
  const filteredAndSortedTeam = useMemo(() => {
    let filtered = team.filter(member => {
      const matchesSearch = member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'username':
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
          break;
        case 'completionRate':
          aValue = a.completionRate;
          bValue = b.completionRate;
          break;
        case 'workload':
          aValue = a.workload;
          bValue = b.workload;
          break;
        case 'assignedProjects':
          aValue = a.assignedProjects;
          bValue = b.assignedProjects;
          break;
        default:
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [team, searchQuery, selectedDepartment, sortField, sortOrder]);

  const getWorkloadColor = (workload: number) => {
    if (workload > 80) return 'text-red-600 bg-red-50 border-red-200';
    if (workload > 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (workload > 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'TERMINE': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentOptions = () => {
    const departments = [...new Set(team.map(m => m.department))];
    return departments;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('all');
    setSortField('username');
    setSortOrder('asc');
  };

  const toggleMemberExpansion = (memberId: number) => {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavChef user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement de l'équipe...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-auto">
          {/* Bannière */}
          <div className="p-6">
            <div className="w-full">
              <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Mon Équipe</h1>
                      <p className="text-white/90 text-lg">Gérez et suivez les performances de votre équipe</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Total: <b>{team.length}</b> membre{team.length > 1 ? 's' : ''}
                    </span>

                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Affichés: <b>{filteredAndSortedTeam.length}</b>
                    </span>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
                      title="Actualiser"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Actualiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres compacts */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white
                             text-gray-900 placeholder:text-gray-500
                             focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
              >
                <option value="all">Tous les départements</option>
                {getDepartmentOptions().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {searchQuery || selectedDepartment !== 'all' ? (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Réinitialiser
                </button>
              ) : null}
            </div>
          </div>

          {/* En-têtes de colonnes */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-4">
                <button
                  onClick={() => handleSort('username')}
                  className="flex items-center gap-2 hover:text-[#4B2A7B] transition-colors"
                >
                  Membre
                  {sortField === 'username' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="col-span-2 text-center">
                <button
                  onClick={() => handleSort('assignedProjects')}
                  className="flex items-center gap-2 hover:text-[#4B2A7B] transition-colors mx-auto"
                >
                  Projets
                  {sortField === 'assignedProjects' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="col-span-2 text-center">
                <button
                  onClick={() => handleSort('completionRate')}
                  className="flex items-center gap-2 hover:text-[#4B2A7B] transition-colors mx-auto"
                >
                  Progression
                  {sortField === 'completionRate' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="col-span-2 text-center">
                <button
                  onClick={() => handleSort('workload')}
                  className="flex items-center gap-2 hover:text-[#4B2A7B] transition-colors mx-auto"
                >
                  Charge
                  {sortField === 'workload' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
          </div>

          {/* Liste des membres - Design épuré */}
          <div className="px-6 py-4">
            <div className="space-y-3">
              {filteredAndSortedTeam.map((member) => (
                <div key={member.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {/* Ligne principale */}
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Informations du membre */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B2A7B] to-[#7E56D9] 
                                        text-white flex items-center justify-center text-sm font-semibold">
                            {member.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{member.username}</div>
                            <div className="text-sm text-gray-600">{member.jobTitle}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {member.department}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Projets assignés */}
                      <div className="col-span-2 text-center">
                        <div className="text-lg font-semibold text-gray-900">{member.assignedProjects}</div>
                        <div className="text-xs text-gray-500">projets</div>
                      </div>

                      {/* Progression */}
                      <div className="col-span-2 text-center">
                        <div className="text-lg font-semibold text-gray-900">{member.completionRate}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-[#4B2A7B] to-[#7E56D9] rounded-full transition-all duration-300"
                            style={{ width: `${member.completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Charge de travail */}
                      <div className="col-span-2 text-center">
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getWorkloadColor(member.workload)}`}>
                          {member.workload}%
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 text-center">
                        <button
                          onClick={() => toggleMemberExpansion(member.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title={expandedMember === member.id ? "Masquer les détails" : "Voir les détails"}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section détaillée (expandable) */}
                  {expandedMember === member.id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Contact */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Informations de contact</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                {member.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              {member.role}
                            </div>
                          </div>
                        </div>

                        {/* Projets */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Projets assignés</h4>
                          <div className="space-y-2">
                            {member.projects.length > 0 ? (
                              member.projects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 truncate">{project.titre}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.statut)}`}>
                                    {project.progression}%
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">Aucun projet assigné</span>
                            )}
                          </div>
                        </div>

                                                 {/* Métriques de performance - Design amélioré */}
                         <div>
                           <h4 className="text-sm font-medium text-gray-700 mb-4">Métriques de performance</h4>
                           <div className="space-y-4">
                             {/* Taux de completion */}
                             <div className="bg-white rounded-lg p-3 border border-gray-200">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-sm font-medium text-gray-700">Taux de completion</span>
                                 <span className="text-lg font-bold text-[#4B2A7B]">{member.completionRate}%</span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-2">
                                 <div
                                   className="h-2 bg-gradient-to-r from-[#4B2A7B] to-[#7E56D9] rounded-full transition-all duration-300"
                                   style={{ width: `${member.completionRate}%` }}
                                 />
                               </div>
                             </div>

                             {/* Charge de travail */}
                             <div className="bg-white rounded-lg p-3 border border-gray-200">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-sm font-medium text-gray-700">Charge de travail</span>
                                 <span className={`text-lg font-bold ${member.workload > 80 ? 'text-red-600' : member.workload > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                                   {member.workload}%
                                 </span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-2">
                                 <div
                                   className={`h-2 rounded-full transition-all duration-300 ${
                                     member.workload > 80 ? 'bg-red-500' : member.workload > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                   }`}
                                   style={{ width: `${member.workload}%` }}
                                 />
                               </div>
                             </div>

                             {/* Détail des tâches */}
                             <div className="grid grid-cols-2 gap-3">
                               <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                 <div className="flex items-center gap-2 mb-1">
                                   <CheckCircle2 className="h-4 w-4 text-green-600" />
                                   <span className="text-xs font-medium text-green-700">Terminées</span>
                                 </div>
                                 <span className="text-lg font-bold text-green-800">{member.completedTasks}</span>
                               </div>
                               <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                 <div className="flex items-center gap-2 mb-1">
                                   <PauseCircle className="h-4 w-4 text-blue-600" />
                                   <span className="text-xs font-medium text-blue-700">En cours</span>
                                 </div>
                                 <span className="text-lg font-bold text-blue-800">{member.pendingTasks}</span>
                               </div>
                               <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                 <div className="flex items-center gap-2 mb-1">
                                   <XCircle className="h-4 w-4 text-red-600" />
                                   <span className="text-xs font-medium text-red-700">Bloquées</span>
                                 </div>
                                 <span className="text-lg font-bold text-red-800">{member.blockedTasks}</span>
                               </div>
                               <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                 <div className="flex items-center gap-2 mb-1">
                                   <Clock className="h-4 w-4 text-gray-600" />
                                   <span className="text-xs font-medium text-gray-700">Total</span>
                                 </div>
                                 <span className="text-lg font-bold text-gray-800">{member.totalTasks}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredAndSortedTeam.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre trouvé</h3>
                  <p className="text-gray-600 mb-4">Essayez de modifier vos critères de recherche</p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
