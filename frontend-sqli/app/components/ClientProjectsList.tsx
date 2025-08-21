// app/components/ClientProjectsList.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, Clock, AlertTriangle, ExternalLink, Eye, Target, FolderOpen } from 'lucide-react';
import type { ClientProject } from '../services/clientService';

interface ClientProjectsListProps {
  projects: ClientProject[];
}

export default function ClientProjectsList({ projects }: ClientProjectsListProps) {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const toggleExpanded = (projectId: number) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TERMINE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ANNULE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EN_COURS': return <Clock className="h-4 w-4" />;
      case 'TERMINE': return <CheckCircle className="h-4 w-4" />;
      case 'EN_ATTENTE': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULE': return 'Annulé';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TMA': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Interne': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
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

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
        <p className="text-gray-500">Vous n'avez pas encore de projets assignés.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mes Projets</h2>
          <Link
            to="/client/projects"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
          >
            Voir tous
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
                 {projects.slice(0, 5).map((project) => (
           <ProjectCard
             key={project.id}
             project={project}
             isExpanded={expandedProject === project.id}
             onToggleExpanded={() => toggleExpanded(project.id)}
             getStatusColor={getStatusColor}
             getStatusIcon={getStatusIcon}
             getStatusLabel={getStatusLabel}
             getTypeColor={getTypeColor}
             formatDate={formatDate}
           />
         ))}
      </div>
      
      {projects.length > 5 && (
        <div className="px-6 py-4 bg-gray-50 text-center">
          <Link
            to="/client/projects"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Voir {projects.length - 5} autres projets →
          </Link>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ 
  project, 
  isExpanded, 
  onToggleExpanded,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  getTypeColor,
  formatDate
}: {
  project: ClientProject;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusLabel: (status: string) => string;
  getTypeColor: (type: string) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-2">
             <h3 className="text-lg font-semibold text-gray-900 truncate">
               {project.titre}
             </h3>
             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
               {getStatusIcon(project.statut)}
               <span className="ml-1">{getStatusLabel(project.statut)}</span>
             </span>
             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(project.type)}`}>
               {project.type}
             </span>
           </div>
          
          <p className="text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(project.dateDebut)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project.developpeurs?.length || 0} développeur{project.developpeurs?.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {project.totalTasks || 0} tâche{project.totalTasks !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Barre de progression */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium text-gray-900">{project.progression}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progression}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onToggleExpanded}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={isExpanded ? "Réduire" : "Développer"}
          >
            <Eye className="h-4 w-4" />
          </button>
          <Link
            to={`/client/projects/${project.id}`}
            className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Section développée */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Développeurs */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Équipe</h4>
              {project.developpeurs && project.developpeurs.length > 0 ? (
                <div className="space-y-2">
                  {project.developpeurs.map((dev) => (
                    <div key={dev.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-indigo-700">
                          {dev.nom.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700">{dev.nom}</span>
                      {dev.jobTitle && (
                        <span className="text-gray-500 text-xs">({dev.jobTitle})</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucun développeur assigné</p>
              )}
            </div>
            
            {/* Tâches */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tâches</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{project.totalTasks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Terminées</span>
                  <span className="font-medium text-green-600">{project.completedTasks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">En cours</span>
                  <span className="font-medium text-blue-600">{project.inProgressTasks || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
