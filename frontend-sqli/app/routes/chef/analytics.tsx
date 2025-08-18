import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '../../services/api';
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

  useEffect(() => {
    const load = async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        const [buildRes, tmaRes] = await Promise.all([
          fetch('http://localhost:8080/api/analytics/projects/build', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch('http://localhost:8080/api/analytics/projects/tma', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        setBuild(await buildRes.json());
        setTma(await tmaRes.json());
      } catch (e) {
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Projets Build</h2>
                <div className="space-y-3">
                  {build.map((p) => (
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
                  {build.length === 0 && <p className="text-gray-500">Aucun projet</p>}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Projets TMA</h2>
                <div className="space-y-3">
                  {tma.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{p.titre}</div>
                      <div className="text-xs text-gray-600">{Math.round(p.completionRate ?? 0)}%</div>
                    </div>
                  ))}
                  {tma.length === 0 && <p className="text-gray-500">Aucun projet TMA</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


