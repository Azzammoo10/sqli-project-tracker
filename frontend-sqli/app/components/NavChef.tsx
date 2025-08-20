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
        <aside className="w-64 min-h-screen flex flex-col bg-[#241a31] text-white shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-[#5B3A8B] text-center">
                <div className="w-24 h-24 mx-auto flex items-center justify-center mb-3">
                    <img
                        src={sqliLogo}
                        alt="SQLI Logo"
                        className="h-20 object-contain filter brightness-0 invert"
                    />
                </div>
                <p className="text-sm text-white/80 font-medium tracking-wide">
                    SQLI • Espace Chef de Projet
                </p>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {navItems.map(({ path, icon: Icon, label }) => {
                        const active = isActive(path);
                        return (
                            <li key={path}>
                                <Link
                                    to={path}
                                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                                        active
                                            ? 'bg-white/90 text-[#4B2A7B] shadow-inner'
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {/* Active indicator */}
                                    <span
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-r-md ${
                                            active
                                                ? 'bg-[#a894e5]'
                                                : 'bg-transparent group-hover:bg-white/30'
                                        }`}
                                    />
                                    {/* Icon container */}
                                    <span
                                        className={`shrink-0 p-2 rounded-lg transition ${
                                            active
                                                ? 'bg-[#f4f0ff]'
                                                : 'bg-white/10 group-hover:bg-white/15'
                                        }`}
                                    >
                    <Icon className={`w-5 h-5 ${active ? 'text-[#4B2A7B]' : 'text-white'}`} />
                  </span>

                                    <span className="text-sm font-medium truncate">{label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Profil / Déconnexion */}
            <div className="mt-auto px-4 py-5 border-t border-white/10 bg-[#2a1f3b]/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-white text-[#4B2A7B] rounded-full grid place-items-center shadow-sm">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.username || 'Chef de Projet'}
                        </p>
                        <p className="text-[11px] text-white/60 truncate">
                            {user?.email || 'chef@sqli.com'}
                        </p>
                    </div>
                    <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-200/40" />
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/15 transition text-sm"
                >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
