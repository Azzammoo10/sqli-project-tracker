import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '../../services/api';
import { chefDashboardService } from '../../services/chefDashboardService';
import toast from 'react-hot-toast';

interface BuildProject {
  projectId: number;
  titre: string;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
}

export default function ChefAnalytics() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [build, setBuild] = useState<BuildProject[]>([]);
  const [tma, setTma] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        
        // Utiliser le service du dashboard pour récupérer les données
        const [statsData, buildData, tmaData] = await Promise.all([
          chefDashboardService.getDashboardStats(),
          chefDashboardService.getProjectsOverview(),
          chefDashboardService.getProjectsOverview() // Pour l'instant, utiliser les mêmes données
        ]);
        
        setStats(statsData);
        setBuild(buildData.map((p: any) => ({
          projectId: p.id,
          titre: p.titre,
          completionRate: p.progression || 0,
          totalTasks: p.tasks?.length || 0,
          completedTasks: p.tasks?.filter((t: any) => t.statut === 'TERMINE')?.length || 0
        })));
        setTma(tmaData.filter((p: any) => p.type === 'TMA').map((p: any) => ({
          projectId: p.id,
          titre: p.titre,
          completionRate: p.progression || 0,
          totalTasks: p.tasks?.length || 0,
          completedTasks: p.tasks?.filter((t: any) => t.statut === 'TERMINE')?.length || 0
        })));
      } catch (e) {
        console.error('Erreur lors du chargement des analytics:', e);
        toast.error('Erreur lors du chargement des analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavChef user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
            
            {/* Statistiques générales */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Projets Actifs</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeProjects}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Tâches en Cours</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Taux de Réussite</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.averageCompletionRate}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Équipe</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.teamMembers}</div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Projets Build</h2>
                <div className="space-y-3">
                  {build.filter(p => p.titre && p.completionRate !== undefined).map((p) => (
                    <div key={p.projectId} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{p.titre}</div>
                        <div className="text-xs text-gray-500">{p.completedTasks}/{p.totalTasks} tâches</div>
                      </div>
                      <div className="w-40">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#4B2A7B]" style={{ width: `${Math.round(p.completionRate)}%` }} />
                        </div>
                        <div className="text-xs text-right text-gray-600">{Math.round(p.completionRate)}%</div>
                      </div>
                    </div>
                  ))}
                  {build.filter(p => p.titre && p.completionRate !== undefined).length === 0 && <p className="text-gray-500">Aucun projet</p>}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Projets TMA</h2>
                <div className="space-y-3">
                  {tma.filter(p => p.titre && p.completionRate !== undefined).map((p) => (
                    <div key={p.projectId} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{p.titre}</div>
                        <div className="text-xs text-gray-500">{p.completedTasks}/{p.totalTasks} tâches</div>
                      </div>
                      <div className="w-40">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#4B2A7B]" style={{ width: `${Math.round(p.completionRate)}%` }} />
                        </div>
                        <div className="text-xs text-right text-gray-600">{Math.round(p.completionRate)}%</div>
                      </div>
                    </div>
                  ))}
                  {tma.filter(p => p.titre && p.completionRate !== undefined).length === 0 && <p className="text-gray-500">Aucun projet TMA</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


