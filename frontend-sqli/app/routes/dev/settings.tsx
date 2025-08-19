import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavDev from '../../components/NavDev';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role: string;
  jobTitle?: string;
  department?: string;
  createdAt: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  taskAssigned: boolean;
  projectUpdates: boolean;
  deadlineReminders: boolean;
  teamUpdates: boolean;
}

export default function DevSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    role: '',
    jobTitle: '',
    department: '',
    createdAt: ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    taskAssigned: true,
    projectUpdates: true,
    deadlineReminders: true,
    teamUpdates: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      // Mapper les données utilisateur vers le profil
      setProfile({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        address: userData.address || '',
        role: userData.role,
        jobTitle: userData.jobTitle || 'Développeur',
        department: userData.department || 'IT',
        createdAt: userData.createdAt || new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Erreur lors du chargement du profil');
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // TODO: Implémenter l'endpoint de mise à jour du profil
      // await userService.updateProfile(profile);
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setSaving(true);
      
      // TODO: Implémenter l'endpoint de changement de mot de passe
      // await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Mot de passe mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // TODO: Implémenter l'endpoint de mise à jour des notifications
      // await userService.updateNotificationSettings(notifications);
      
      toast.success('Paramètres de notification mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des notifications');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
        <div className="flex h-screen bg-gray-50">
          <NavDev user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-sm text-gray-600">
                  Gérez votre profil et vos préférences
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'profile', name: 'Profil', icon: User },
                    { id: 'password', name: 'Mot de passe', icon: Lock },
                    { id: 'notifications', name: 'Notifications', icon: Bell },
                    { id: 'security', name: 'Sécurité', icon: Shield },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-[#4B2A7B] text-[#4B2A7B]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom d'utilisateur
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                              type="text"
                              value={profile.username}
                              onChange={(e) => setProfile({...profile, username: e.target.value})}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                              disabled
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Le nom d'utilisateur ne peut pas être modifié</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                              type="email"
                              value={profile.email}
                              onChange={(e) => setProfile({...profile, email: e.target.value})}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom
                          </label>
                          <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom
                          </label>
                          <input
                            type="text"
                            value={profile.lastName}
                            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => setProfile({...profile, phone: e.target.value})}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Poste
                          </label>
                          <input
                            type="text"
                            value={profile.jobTitle}
                            onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                          <textarea
                            value={profile.address}
                            onChange={(e) => setProfile({...profile, address: e.target.value})}
                            rows={3}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mt-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>Membre depuis: {formatDate(profile.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="w-4 h-4" />
                          <span>Rôle: {profile.role === 'DEVELOPPEUR' ? 'Développeur' : profile.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                      
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe actuel
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                              className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nouveau mot de passe
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                              className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                              required
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le nouveau mot de passe
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                              className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                              required
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 mt-4">
                        <p className="text-sm text-blue-800">
                          <strong>Conseils pour un mot de passe sécurisé:</strong>
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                          <li>Au moins 8 caractères</li>
                          <li>Mélanger lettres majuscules et minuscules</li>
                          <li>Inclure des chiffres et caractères spéciaux</li>
                          <li>Éviter les informations personnelles</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Mise à jour...' : 'Changer le mot de passe'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <form onSubmit={handleNotificationSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences de notification</h3>
                      
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'Notifications par email', description: 'Recevoir toutes les notifications par email' },
                          { key: 'taskAssigned', label: 'Nouvelles tâches assignées', description: 'Être notifié quand une tâche vous est assignée' },
                          { key: 'projectUpdates', label: 'Mises à jour de projet', description: 'Recevoir les notifications de changements sur vos projets' },
                          { key: 'deadlineReminders', label: 'Rappels d\'échéance', description: 'Être alerté avant les dates limites de vos tâches' },
                          { key: 'teamUpdates', label: 'Activité de l\'équipe', description: 'Recevoir les notifications d\'activité de votre équipe' },
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-start justify-between py-3">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                              <p className="text-sm text-gray-600">{setting.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                              <input
                                type="checkbox"
                                checked={notifications[setting.key as keyof NotificationSettings] as boolean}
                                onChange={(e) => setNotifications({
                                  ...notifications,
                                  [setting.key]: e.target.checked
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4B2A7B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B2A7B]"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Sécurité du compte</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-600" />
                            <div>
                              <h4 className="text-sm font-medium text-green-900">Compte sécurisé</h4>
                              <p className="text-sm text-green-700">Votre compte utilise une authentification sécurisée</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Sessions actives</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-700">Session actuelle</p>
                                <p className="text-xs text-gray-500">Navigateur principal • {new Date().toLocaleString('fr-FR')}</p>
                              </div>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Actuel</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-yellow-600" />
                            <div>
                              <h4 className="text-sm font-medium text-yellow-900">Conseils de sécurité</h4>
                              <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                                <li>• Changez régulièrement votre mot de passe</li>
                                <li>• Ne partagez jamais vos identifiants</li>
                                <li>• Déconnectez-vous sur les appareils partagés</li>
                                <li>• Signaler toute activité suspecte</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}