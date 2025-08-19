import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

interface NavDevProps {
  user: any;
  onLogout: () => void;
}

export default function NavDev({ user, onLogout }: NavDevProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dev/dashboard', icon: LayoutDashboard },
    { name: 'Mes Projets', href: '/dev/projects', icon: FolderOpen },
    { name: 'Mes Tâches', href: '/dev/tasks', icon: Clock },
    { name: 'Mon Équipe', href: '/dev/team', icon: Users },
    { name: 'Paramètres', href: '/dev/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav className="bg-[#4B2A7B] text-white w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#5B3A8B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Développeur</h2>
            <p className="text-sm text-white/80">{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-[#5B3A8B]">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden absolute top-4 right-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-[#4B2A7B] z-50">
            {/* Mobile header */}
            <div className="p-6 border-b border-[#5B3A8B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Développeur</h2>
                    <p className="text-sm text-white/80">{user?.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Mobile navigation */}
            <div className="p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Mobile logout */}
            <div className="p-4 border-t border-[#5B3A8B]">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
