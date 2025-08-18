// app/routes/admin/users.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  Edit,     
  User,
  Activity
} from 'lucide-react';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import { userService, type User as UserType } from '../../services/userService';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);

        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (error: any) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔎 recherche
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = users.filter(u =>
      (u.username ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q) ||
      (u.nom ?? '').toLowerCase().includes(q) ||
      (u.prenom ?? '').toLowerCase().includes(q)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('Utilisateur supprimé avec succès');
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        toast.error("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'CHEF_DE_PROJET': return 'bg-blue-100 text-blue-800';
      case 'DEVELOPPEUR': return 'bg-green-100 text-green-800';
      case 'CLIENT': return 'bg-purple-100 text-purple-800';
      case 'STAGIAIRE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const DashboardContent = () => {
    if (loading) {
      return (
        <div className="flex h-screen">
          <NavAdmin user={user} onLogout={handleLogout} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-gray-50">
        <NavAdmin user={user} onLogout={handleLogout} />

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Manage Equipe</h1>
              <p className="text-gray-600">Filter, sort, and access detailed user profiles</p>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white
                 text-gray-900 placeholder:text-gray-500
                 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                />
              </div>

              <button
                onClick={() => navigate('/admin/users/create')}
                className="bg-[#4B2A7B] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#5B3A8B] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span> Add new user</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JOB TITLE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL ADDRESS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USERNAME</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROLE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-[#4B2A7B] flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {u.prenom && u.nom ? `${u.prenom} ${u.nom}` : (u.username ?? '—')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {u.dateCreation ? new Date(u.dateCreation).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.role.replace('_', ' ')}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.email}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.username ?? '—'}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(u.role)}`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* ✏️ Modifier */}
                            <button
                              onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                              className="text-[#4B2A7B] hover:text-[#5B3A8B]"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {/* 🗑️ Supprimer */}
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastUser, filteredUsers.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredUsers.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-[#4B2A7B] border-[#4B2A7B] text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
