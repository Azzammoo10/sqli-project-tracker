import { ClipboardList, Plus } from 'lucide-react';

export function Header({ user, onNewProject, onTasks }:{
    user:any; onNewProject:()=>void; onTasks:()=>void;
}) {
    return (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bonjour {user?.username?.toUpperCase()} 👋</h1>
                    <p className="text-gray-600">Vue d’ensemble des projets, tâches et équipe</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onNewProject} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4B2A7B] text-white hover:bg-[#5B3A8B] transition">
                        <Plus className="w-4 h-4" /> Nouveau projet
                    </button>
                    <button onClick={onTasks} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 text-gray-800 transition">
                        <ClipboardList className="w-4 h-4" /> Gérer les tâches
                    </button>
                </div>
            </div>
        </header>
    );
}
