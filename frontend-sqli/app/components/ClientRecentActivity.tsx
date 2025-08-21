// app/components/ClientRecentActivity.tsx
import { Clock, User, FileText, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

interface Activity {
  id: number;
  type: 'PROJECT_CREATED' | 'TASK_COMPLETED' | 'PROJECT_UPDATED' | 'DEVELOPER_ASSIGNED' | 'MILESTONE_REACHED';
  description: string;
  timestamp: string;
  projectId?: number;
  projectName?: string;
  userName?: string;
}

interface ClientRecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'PROJECT_CREATED': return <FileText className="w-4 h-4" />;
    case 'TASK_COMPLETED': return <CheckCircle className="w-4 h-4" />;
    case 'PROJECT_UPDATED': return <FileText className="w-4 h-4" />;
    case 'DEVELOPER_ASSIGNED': return <User className="w-4 h-4" />;
    case 'MILESTONE_REACHED': return <CheckCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'PROJECT_CREATED': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'TASK_COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
    case 'PROJECT_UPDATED': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'DEVELOPER_ASSIGNED': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MILESTONE_REACHED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case 'PROJECT_CREATED': return 'Nouveau projet';
    case 'TASK_COMPLETED': return 'Tâche terminée';
    case 'PROJECT_UPDATED': return 'Projet mis à jour';
    case 'DEVELOPER_ASSIGNED': return 'Développeur assigné';
    case 'MILESTONE_REACHED': return 'Étape atteinte';
    default: return 'Activité';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'À l\'instant';
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  if (diffInHours < 48) return 'Hier';
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ClientRecentActivity({ activities }: ClientRecentActivityProps) {
  if (!activities.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité récente</h3>
        <p className="text-gray-500">Les activités de vos projets apparaîtront ici.</p>
      </div>
    );
  }

  // Trier par timestamp (plus récent en premier)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#1F1B2E] to-[#3D2B66] rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activités Récentes</h3>
          <p className="text-sm text-gray-500">Suivi des dernières actions sur vos projets</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedActivities.slice(0, 8).map((activity, index) => (
          <div key={activity.id} className="relative">
            {/* Ligne de connexion */}
            {index < Math.min(sortedActivities.length, 8) - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-4 bg-gray-200" />
            )}
            
            <div className="flex items-start gap-4">
              {/* Icône d'activité */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              
              {/* Contenu de l'activité */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                        {getActivityLabel(activity.type)}
                      </span>
                      {activity.projectName && (
                        <span className="text-sm text-gray-600 font-medium">
                          • {activity.projectName}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-900 text-sm">{activity.description}</p>
                    
                    {activity.userName && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>Par {activity.userName}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-medium">
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Voir plus d'activités */}
      {activities.length > 8 && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <button className="text-sm text-[#4B2A7B] hover:text-[#3D2B66] font-medium">
            Voir toutes les activités ({activities.length})
          </button>
        </div>
      )}
      
      {/* Légende */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Nouveaux projets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Tâches terminées</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>Mises à jour</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>Assignations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
