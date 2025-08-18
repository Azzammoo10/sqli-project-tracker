// app/routes/chef/settings.tsx
import { useEffect, useState } from 'react';
import { Activity, Edit, Mail, ShieldCheck, User, Globe, BadgeCheck } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

type Profile = {
  id: number; username: string; email: string; role: string;
  nom?: string; prenom?: string; jobTitle?: string;
  gender?: 'Homme'|'Femme'|'Autre'; language?: string; skills?: string[];
  actif?: boolean; createdAt?: string; avatarUrl?: string; emails?: string[]; statusSince?: string;
};

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{children}</span>
);

export default function ChefSettings() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const me = await authService.getCurrentUser();
      setUser({
        ...me,
        emails: [me.email],
        language: me.language ?? 'fr',
        skills: me.skills ?? ['Agile'],
        jobTitle: me.jobTitle ?? 'Chef de Projet',
        actif: me.actif ?? true,
      });
    } catch (e) { console.error(e); toast.error("Impossible de charger le profil"); }
    finally { setLoading(false); }
  })(); }, []);

  const handleLogout = async () => { try { await authService.logout(); window.location.href='/auth/login'; } catch { toast.error('Erreur lors de la déconnexion'); } };

  if (loading) return (
    <div className="flex h-screen">
      <NavChef user={user ?? undefined} onLogout={handleLogout} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
          <p className="text-gray-600">Chargement du profil…</p>
        </div>
      </div>
    </div>
  );
  if (!user) return null;

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome {user.username?.toUpperCase()} 👋</h1>
            <p className="text-gray-600 mb-6">Espace paramètres du Chef de Projet</p>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img src={user.avatarUrl ?? '/avatar.svg'} className="w-16 h-16 rounded-full bg-gray-100" />
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {user.nom ? `${user.nom} ${user.prenom ?? ''}` : user.username}
                    </div>
                    <div className="text-sm text-gray-500">{user.jobTitle}</div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-md bg-[#4B2A7B] text-white hover:opacity-90 flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500">Full Name</label>
                  <input readOnly className="mt-1 w-full px-3 py-2 rounded-md bg-white text-black border border-gray-300"
                    value={user.nom ? `${user.nom} ${user.prenom ?? ''}` : user.username} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Job Title</label>
                  <input readOnly className="mt-1 w-full px-3 py-2 rounded-md bg-white text-black border border-gray-300"
                    value={user.jobTitle ?? ''} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Gender</label>
                  <input readOnly className="mt-1 w-full px-3 py-2 rounded-md bg-white text-black border border-gray-300"
                    value={user.gender ?? ''} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Skills</label>
                  <div className="mt-2 flex flex-wrap gap-2">{(user.skills ?? []).map(s => <Chip key={s}>{s}</Chip>)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Language</label>
                  <input readOnly className="mt-1 w-full px-3 py-2 rounded-md bg-white text-black border border-gray-300"
                    value={(user.language ?? 'fr').toUpperCase()} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <div className="mt-2">
                    {user.actif ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <BadgeCheck className="w-3 h-3" /> Actif • {user.statusSince ?? '—'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Inactif
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-sm font-semibold text-gray-900 mb-3">My email Address</div>
                {(user.emails ?? [user.email]).map((e,i)=>(
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-gray-100"><Mail className="w-4 h-4 text-gray-600"/></div>
                    <div className="text-gray-900">{e}</div>
                    <div className="text-xs text-gray-500">• {i===0?'principal':'ajouté récemment'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 flex items-center gap-4">
              <span className="inline-flex items-center gap-1"><User className="w-3 h-3" /> {user.username}</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {user.role}</span>
              <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" /> {(user.language ?? 'fr').toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
