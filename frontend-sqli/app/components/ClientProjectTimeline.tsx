// app/components/ClientProjectTimeline.tsx
import { Calendar, Clock, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import type { ProjectTimeline } from '../services/clientService';

interface ClientProjectTimelineProps {
  projects: ProjectTimeline[];
}

const getStatusColor = (statut: string) => {
  switch (statut) {
    case 'EN_COURS': return 'bg-green-100 text-green-800 border-green-200';
    case 'TERMINE': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ANNULE': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (statut: string) => {
  switch (statut) {
    case 'EN_COURS': return <Clock className="w-4 h-4" />;
    case 'TERMINE': return <CheckCircle className="w-4 h-4" />;
    case 'EN_ATTENTE': return <AlertTriangle className="w-4 h-4" />;
    case 'ANNULE': return <AlertTriangle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'TMA': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Interne': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ClientProjectTimeline({ projects }: ClientProjectTimelineProps) {
  if (!projects.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet planifié</h3>
        <p className="text-gray-500">Votre timeline de projets apparaîtra ici.</p>
      </div>
    );
  }

  // Trier les projets par date de début
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#1F1B2E] to-[#3D2B66] rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Timeline des Projets</h3>
          <p className="text-sm text-gray-500">Vue chronologique de vos projets</p>
        </div>
      </div>

      <div className="space-y-6">
        {sortedProjects.map((project, index) => (
          <div key={project.id} className="relative">
            {/* Ligne de connexion */}
            {index < sortedProjects.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200" />
            )}
            
            <div className="flex items-start gap-4">
              {/* Indicateur de date */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1F1B2E] to-[#3D2B66] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {formatDate(project.dateDebut).split(' ')[0]}
                </div>
              </div>
              
              {/* Contenu du projet */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{project.titre}</h4>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
                        {getStatusIcon(project.statut)}
                        <span className="ml-1">
                          {project.statut === 'EN_COURS' ? 'En cours' :
                           project.statut === 'TERMINE' ? 'Terminé' :
                           project.statut === 'EN_ATTENTE' ? 'En attente' :
                           project.statut === 'ANNULE' ? 'Annulé' : project.statut}
                        </span>
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(project.type)}`}>
                        {project.type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progression */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{Math.round(project.progression)}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          project.progression >= 100 ? 'bg-green-500' : 'bg-[#4B2A7B]'
                        }`}
                        style={{ width: `${Math.min(project.progression, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Dates et métriques */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Début: {formatDate(project.dateDebut)}</span>
                    </div>
                    {project.dateFin && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>Fin: {formatDate(project.dateFin)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Statut de progression */}
                  <div className="text-right">
                    {project.progression >= 100 ? (
                      <span className="text-green-600 font-medium">✓ Terminé</span>
                    ) : project.progression >= 75 ? (
                      <span className="text-blue-600 font-medium">🔄 Presque fini</span>
                    ) : project.progression >= 50 ? (
                      <span className="text-orange-600 font-medium">⚡ En bonne voie</span>
                    ) : project.progression >= 25 ? (
                      <span className="text-yellow-600 font-medium">🚀 Démarrage</span>
                    ) : (
                      <span className="text-gray-600 font-medium">📋 Planifié</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Légende */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>En attente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Annulé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
