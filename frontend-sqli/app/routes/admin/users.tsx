import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Trash2, Edit, User, Activity, RotateCcw, FilterX, AlertTriangle, X
} from 'lucide-react';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import { userService, type User as UserType } from '../../services/userService';
import toast from 'react-hot-toast';

const ROLE_ORDER = ['ADMIN', 'CHEF_DE_PROJET', 'DEVELOPPEUR', 'CLIENT', 'STAGIAIRE'] as const;
type RoleFilter = 'ALL' | (typeof ROLE_ORDER)[number];

const roleChipClass = (active: boolean) =>
  `px-3 py-1.5 text-xs rounded-full border transition ${
    active
      ? 'bg-[#4B2A7B] text-white border-[#4B2A7B] shadow-sm'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
  }`;

const roleBadge = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-red-100 text-red-800';
    case 'CHEF_DE_PROJET': return 'bg-blue-100 text-blue-800';
    case 'DEVELOPPEUR': return 'bg-green-100 text-green-800';
    case 'CLIENT': return 'bg-purple-100 text-purple-800';
    case 'STAGIAIRE': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);
  const [user, setUser] = useState<any>(null);

  // Harmonisation UI
  const [q, setQ] = useState('');
  const [role, setRole] = useState<RoleFilter>('ALL');

  // Pagination harmonisée (fenêtre de 10)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // États pour la modal de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        const all = await userService.getAllUsers();
        setUsers(all ?? []);
      } catch (error: any) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const openDeleteModal = (userToDelete: UserType) => {
    setUserToDelete(userToDelete);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const onDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUserId(userToDelete.id);
      await userService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      toast.success('Utilisateur supprimé avec succès');
      closeDeleteModal();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      
      // Gestion d'erreur plus détaillée
      let errorMessage = "Erreur lors de la suppression de l'utilisateur";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = "Impossible de supprimer cet utilisateur (accès refusé)";
      } else if (error.response?.status === 404) {
        errorMessage = "Utilisateur non trouvé";
      } else if (error.response?.status === 409) {
        errorMessage = "Impossible de supprimer cet utilisateur (conflit avec d'autres données)";
      }
      
      toast.error(errorMessage);
    } finally {
      setDeletingUserId(null);
    }
  };

  const resetAll = () => {
    setQ('');
    setRole('ALL');
    setPage(1);
  };

  // Filtre + recherche
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return users.filter(u => {
      const matchQ = !k
        ? true
        : (u.username ?? '').toLowerCase().includes(k) ||
          (u.email ?? '').toLowerCase().includes(k) ||
          (u.nom ?? '').toLowerCase().includes(k) ||
          (u.prenom ?? '').toLowerCase().includes(k) ||
          (u.role ?? '').toLowerCase().includes(k);

      const matchRole = role === 'ALL' ? true : (u.role === role);
      return matchQ && matchRole;
    });
  }, [users, q, role]);

  // Pagination (fenêtre de 5 pages affichées)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const current = filtered.slice(start, end);

  useEffect(() => { setPage(1); }, [q, role]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavAdmin user={user} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des utilisateurs…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavAdmin user={user} onLogout={onLogout} />
        <div className="flex-1 overflow-auto">
          {/* Header harmonisé */}
          <div className="p-6">
            <div className="w-full">
              <div className="relative rounded-xl text-white p-5 shadow-md bg-[#372362]">
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                  style={{
                    background:
                      'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)'
                  }}
                />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-6 w-6 text-white/90" />
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight">Gestion des Utilisateurs</h1>
                      <p className="text-white/85">Filtre, recherche et accès aux profils</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Total: <b>{users.length}</b>
                    </span>
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Affichés: <b>{filtered.length}</b>
                    </span>
                    <button
                      onClick={resetAll}
                      className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-full"
                      title="Réinitialiser"
                    >
                      <RotateCcw className="h-4 w-4" /> Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recherche + filtres (chips) */}
          <div className="px-6">
            <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="relative flex-1 max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher… (nom, username, email, rôle)"
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white
                               text-gray-900 placeholder:text-gray-500
                               focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className={roleChipClass(role === 'ALL')} onClick={() => setRole('ALL')}>
                    Tous
                  </button>
                  {ROLE_ORDER.map(r => (
                    <button
                      key={r}
                      className={roleChipClass(role === r)}
                      onClick={() => setRole(r)}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                  {(role !== 'ALL' || q) && (
                    <button
                      onClick={resetAll}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-200 text-black"
                      title="Effacer filtres"
                    >
                      <FilterX className="h-4 w-4 text-black" /> Effacer
                    </button>
                  )}
                </div>

                <button
                  onClick={() => navigate('/admin/users/create')}
                  className="bg-[#4B2A7B] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:brightness-110 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter un utilisateur</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="text-left">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {current.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-[#4B2A7B] flex items-center justify-center shadow-sm">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {u.prenom && u.nom ? `${u.prenom} ${u.nom}` : (u.username ?? '—')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {u.dateCreation ? new Date(u.dateCreation).toLocaleDateString() : '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.role?.replace('_', ' ') ?? '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.email ?? '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.username ?? '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadge(u.role)}`}>
                            {u.role?.replace('_', ' ') ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                              className="text-[#4B2A7B] hover:text-[#5B3A8B]"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(u)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {current.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16">
                          <div className="flex flex-col items-center justify-center text-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <Search className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="text-gray-900 font-medium">Aucun utilisateur à afficher</div>
                            <div className="text-gray-500 text-sm max-w-md">
                              Ajustez la recherche ou réinitialisez les filtres.
                            </div>
                            <button
                              onClick={resetAll}
                              className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#4B2A7B] text-white hover:brightness-110 shadow-sm"
                            >
                              <RotateCcw className="h-4 w-4" /> Réinitialiser
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination harmonisée */}
              {filtered.length > 0 && (
                <div className="bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Éléments <span className="font-medium">{filtered.length === 0 ? 0 : start + 1}</span>–<span className="font-medium">{end}</span> sur <span className="font-medium">{filtered.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                      const p = startPage + i;
                      return p <= totalPages ? (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-2 border text-sm rounded-md transition ${
                            p === page
                              ? 'bg-[#4B2A7B] border-[#4B2A7B] text-white shadow-sm'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ) : null;
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay avec animation */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeDeleteModal}
          />
          
          {/* Modal avec animation */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                  <p className="text-sm text-gray-500">Cette action est irréversible</p>
                </div>
              </div>
              <button
                onClick={closeDeleteModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Êtes-vous sûr de vouloir supprimer l'utilisateur :
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-medium text-gray-900">
                  {userToDelete?.prenom} {userToDelete?.nom} ({userToDelete?.username})
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Email: {userToDelete?.email} | 
                  Rôle: {userToDelete?.role}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-100">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={onDelete}
                disabled={deletingUserId === userToDelete?.id}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {deletingUserId === userToDelete?.id ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
