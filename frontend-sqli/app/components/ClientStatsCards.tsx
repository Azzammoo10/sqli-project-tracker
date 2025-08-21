// app/components/ClientStatsCards.tsx
import { FolderOpen, Users, CheckCircle, Clock, TrendingUp, Target } from 'lucide-react';
import type { ClientDashboardStats } from '../services/clientService';

interface ClientStatsCardsProps {
  stats: ClientDashboardStats;
}

export default function ClientStatsCards({ stats }: ClientStatsCardsProps) {
  const statItems = [
    {
      icon: <FolderOpen className="h-6 w-6" />,
      title: "Projets totaux",
      value: stats.totalProjects,
      change: `${stats.activeProjects} en cours`,
      color: "blue",
      description: "Nombre total de vos projets"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Progression moyenne",
      value: `${stats.averageProgress}%`,
      change: `${stats.completedProjects} terminés`,
      color: "green",
      description: "Progression globale de vos projets"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Équipe",
      value: stats.totalDevelopers,
      change: `${stats.totalTasks} tâches`,
      color: "purple",
      description: "Développeurs sur vos projets"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Tâches en cours",
      value: stats.inProgressTasks,
      change: `${stats.completedTasks} terminées`,
      color: "orange",
      description: "Tâches actuellement en cours"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  change, 
  color, 
  description 
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} border`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
          {value}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>
      
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-medium">
          {change}
        </p>
      </div>
    </div>
  );
}
