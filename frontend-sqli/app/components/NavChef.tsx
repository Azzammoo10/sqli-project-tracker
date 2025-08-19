import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import sqliLogo from '../assets/images/SQLI-LOGO.png';

interface NavChefProps {
  user?: {
    username: string;
    email?: string;
  };
  onLogout?: () => void;
}

export default function NavChef({ user, onLogout }: NavChefProps) {
  const location = useLocation();

  const navItems = [
    { path: '/chef/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chef/projects', icon: FolderOpen, label: 'Mes Projets' },
    { path: '/chef/tasks', icon: CheckSquare, label: 'Tâches' },
    { path: '/chef/team', icon: Users, label: 'Équipe' },
    { path: '/chef/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/chef/settings', icon: Settings, label: 'Paramètres' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-[#3c274a] text-white relative">
      {/* Header */}
      <div className="p-6 border-b border-[#5B3A8B] flex flex-col items-center text-center">
        <div className="w-20 h-18 bg-white rounded-full flex items-center justify-center mb-3">
          <img 
            src={sqliLogo} 
            alt="SQLI Digital Experience" 
            className="h-18 w-18 object-contain"
          />
        </div>
        <h1 className="text-white font-semibold text-lg">SQLI Chef</h1>
        <p className="text-gray-300 text-xs">Gestion des projets</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={[
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition',
                    active
                      ? 'bg-white text-[#4B2A7B]'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md transition',
                      active ? 'bg-[#a894e5]' : 'bg-transparent group-hover:bg-white/40'
                    ].join(' ')}
                  />
                  <span
                    className={[
                      'shrink-0 rounded-md p-1.5 grid place-items-center transition',
                      active ? 'bg-[#efeaff]' : 'bg-white/10 group-hover:bg-white/15'
                    ].join(' ')}
                  >
                    <Icon className={active ? 'h-4 w-4 text-[#4B2A7B]' : 'h-4 w-4'} />
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profil / Logout */}
      <div className="mt-auto p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-white text-[#4B2A7B] grid place-items-center shadow-sm">
            <User className="h-5 w-5" />
          </div>
        <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username || 'Chef de Projet'}</p>
            <p className="text-[11px] text-white/75 truncate">{user?.email || 'chef@sqli.com'}</p>
          </div>
          <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-200/30" />
        </div>
        <button
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/15 transition"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
