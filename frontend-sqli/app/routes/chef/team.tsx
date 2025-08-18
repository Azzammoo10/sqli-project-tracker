import { useEffect, useState } from 'react';
import { Activity, Users, CheckCircle2, PauseCircle, XCircle } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

interface TeamMember {
  userId: number;
  fullName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionRate: number;
}

export default function ChefTeam() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        const res = await fetch('http://localhost:8080/api/analytics/dashboard/team', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const data = await res.json();
        setTeam(data);
      } catch (e) {
        toast.error("Erreur lors du chargement de l'équipe");
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
            <p className="text-gray-600">Chargement de l'équipe...</p>
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mon Équipe</h1>
              <p className="text-gray-600">Liste des développeurs</p>
            </div>

            <div className="bg-white rounded-lg shadow divide-y">
              {team.map((m) => (
                <div key={m.userId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                      {m.fullName.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{m.fullName}</div>
                      <div className="text-xs text-gray-500">{m.totalTasks} tâches • {Math.round(m.completionRate)}% complétées</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> {m.completedTasks}</span>
                    <span className="flex items-center gap-1"><PauseCircle className="w-3 h-3 text-amber-600" /> {m.inProgressTasks}</span>
                    <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" /> {m.blockedTasks}</span>
                    <span className="hidden md:inline-flex items-center gap-1"><Users className="w-3 h-3" /> {m.totalTasks}</span>
                  </div>
                </div>
              ))}
              {team.length === 0 && (
                <div className="p-8 text-center text-gray-500">Aucun membre</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


