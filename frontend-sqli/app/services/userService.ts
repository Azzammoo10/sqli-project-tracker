import apiClient from './api';

export type Role =
  | 'ADMIN'
  | 'CHEF_DE_PROJET'
  | 'DEVELOPPEUR'
  | 'CLIENT'
  | 'STAGIAIRE';

export type Department =
  | 'ADMINISTRATION'
  | 'DEVELOPPEMENT'
  | 'EXTERNE'
  | 'MANAGEMENT';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  jobTitle?: string;
  department?: Department;
  phone?: string;
  actif?: boolean;
  nom?: string;     
  prenom?: string;
  dateCreation?: string;
  enabled?: boolean;
}

export interface CreateUserRequestBackend {
  nom: string;
  email: string;
  motDePasse: string;
  role: Role;
  jobTitle?: string;
  department?: Department;
  phone?: string;
}

export interface UpdateUserRequest {
  nom?: string;
  email?: string;
  role?: Role;
  jobTitle?: string;
  department?: Department;
  phone?: string;
  actif?: boolean;
  enabled?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<Role, number>;
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get('/admin/users');
    return data;
  },

  getUserById: async (id: number): Promise<User> => {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data;
  },

  createUser: async (payload: CreateUserRequestBackend): Promise<User> => {
    const { data } = await apiClient.post('/admin/users', payload);
    return data;
  },

  updateUser: async (id: number, payload: UpdateUserRequest): Promise<User> => {
    const { data } = await apiClient.put(`/admin/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  enableUser: async (id: number): Promise<User> => {
    const { data } = await apiClient.put(`/admin/users/${id}/enable`);
    return data;
  },

  disableUser: async (id: number): Promise<User> => {
    const { data } = await apiClient.put(`/admin/users/${id}/disable`);
    return data;
  },

  getUserStats: async (): Promise<UserStats> => {
    const { data } = await apiClient.get('/admin/users/stats');
    return data;
  },

  searchUsers: async (q: string): Promise<User[]> => {
    const { data } = await apiClient.get(`/admin/users/search?q=${encodeURIComponent(q)}`);
    return data;
  },

  getUsersByRole: async (role: Role): Promise<User[]> => {
    const { data } = await apiClient.get(`/admin/users/by-role/${role}`);
    return data;
  },

  // Méthodes pour le profil utilisateur
  getCurrentUserProfile: async (): Promise<User> => {
    const { data } = await apiClient.get('/users/profile');
    return data;
  },

  updateProfile: async (id: number, payload: UpdateUserRequest): Promise<User> => {
    const { data } = await apiClient.put(`/users/${id}/profile`, payload);
    return data;
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/users/change-password', payload);
  },
};
