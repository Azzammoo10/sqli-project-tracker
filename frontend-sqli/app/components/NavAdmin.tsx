import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  History, 
  Settings, 
  Bell,
  LogOut,
  User
} from 'lucide-react';
import sqliLogo from '../assets/images/SQLI-LOGO.png';

interface NavAdminProps {
  user?: {
    username: string;
    email?: string;
  };
  onLogout?: () => void;
}

export default function NavAdmin({ user, onLogout }: NavAdminProps) {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'All users' },
    { path: '/admin/projects', icon: FolderOpen, label: 'Projets' },
    { path: '/admin/history', icon: History, label: 'Historique' },
    { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-[#3c274a] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#5B3A8B]">
        <img 
          src={sqliLogo} 
          alt="SQLI Digital Experience" 
          className="h-8 mx-auto"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-white text-[#4B2A7B] font-medium'
                      : 'text-white hover:bg-[#5B3A8B]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#5B3A8B]">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-[#4B2A7B]" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">
              {user?.username || 'Admin User'}
            </p>
            <p className="text-gray-300 text-xs">
              {user?.email || 'admin@sqli.com'}
            </p>
          </div>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#5B3A8B] rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
