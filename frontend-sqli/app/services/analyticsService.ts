import apiClient from './api';

export interface ProjectAnalytics {
  id: number;
  titre: string;
  type: string;
  progression: number;
  totalTasks: number;
  completedTasks: number;
  plannedHours: number;
  effectiveHours: number;
  teamSize: number;
  statut: string;
  dateDebut: string;
  dateFin?: string;
  client?: {
    id: number;
    nom?: string;
    username: string;
    email: string;
  };
  developpeurs?: Array<{
    id: number;
    nom?: string;
    username: string;
    email: string;
  }>;
}

export interface TaskAnalytics {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  notStarted: number;
  priorityDistribution: {
    ELEVEE: number;
    MOYENNE: number;
    BASSE: number;
  };
  statusDistribution: {
    NON_COMMENCE: number;
    EN_COURS: number;
    BLOQUE: number;
    TERMINE: number;
  };
}

export interface TeamMemberAnalytics {
  id: number;
  username: string;
  nom?: string;
  email: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTaskTime: number;
  projects: string[];
  department?: string;
  jobTitle?: string;
}

export interface MonthlyAnalytics {
  month: string;
  hoursSold: number;
  hoursConsumed: number;
  hoursRemaining: number;
  projectsCount: number;
  tasksCompleted: number;
}

export interface ProjectTypeDistribution {
  Delivery: number;
  TMA: number;
  Interne: number;
}

export interface DashboardAnalytics {
  projects: ProjectAnalytics[];
  tasks: TaskAnalytics;
  team: TeamMemberAnalytics[];
  monthlyData: MonthlyAnalytics[];
  projectTypeDistribution: ProjectTypeDistribution;
  summary: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    totalHoursSold: number;
    totalHoursConsumed: number;
    teamSize: number;
    averageCompletionRate: number;
  };
}

class AnalyticsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(key)) {
      return cached.data;
    }
    return null;
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const cacheKey = 'dashboard_analytics';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // Récupérer toutes les données en parallèle avec gestion d'erreur
      const [projectsResponse, tasksResponse, usersResponse] = await Promise.allSettled([
        apiClient.get('/projects'),
        apiClient.get('/tasks'),
        apiClient.get('/users/role/DEVELOPPEUR')
      ]);

      // Vérifier les réponses et gérer les erreurs
      let projects: any[] = [];
      let tasks: any[] = [];
      let users: any[] = [];

      if (projectsResponse.status === 'fulfilled') {
        projects = projectsResponse.value.data || [];
      } else {
        console.warn('Erreur lors de la récupération des projets:', projectsResponse.reason);
        projects = [];
      }

      if (tasksResponse.status === 'fulfilled') {
        tasks = tasksResponse.value.data || [];
      } else {
        console.warn('Erreur lors de la récupération des tâches:', tasksResponse.reason);
        tasks = [];
      }

      if (usersResponse.status === 'fulfilled') {
        users = usersResponse.value.data || [];
      } else {
        console.warn('Erreur lors de la récupération des utilisateurs:', usersResponse.reason);
        users = [];
      }

      // Traiter les données des projets
      const processedProjects: ProjectAnalytics[] = projects.map((project: any) => ({
        id: project.id,
        titre: project.titre || project.name,
        type: project.type,
        progression: project.progression || 0,
        totalTasks: project.tasks?.length || 0,
        completedTasks: project.tasks?.filter((t: any) => t.statut === 'TERMINE')?.length || 0,
        plannedHours: project.plannedHours || 0,
        effectiveHours: project.effectiveHours || 0,
        teamSize: project.developpeurs?.length || 0,
        statut: project.statut || project.state, // Mapper state vers statut
        dateDebut: project.dateDebut || project.start_date,
        dateFin: project.dateFin || project.date_fin,
        client: project.client,
        developpeurs: project.developpeurs
      }));

      // Traiter les statistiques des tâches
      const taskAnalytics: TaskAnalytics = {
        total: tasks.length,
        completed: tasks.filter((t: any) => t.statut === 'TERMINE').length,
        inProgress: tasks.filter((t: any) => t.statut === 'EN_COURS').length,
        blocked: tasks.filter((t: any) => t.statut === 'BLOQUE').length,
        notStarted: tasks.filter((t: any) => t.statut === 'NON_COMMENCE').length,
        priorityDistribution: {
          ELEVEE: tasks.filter((t: any) => t.priorite === 'ELEVEE').length,
          MOYENNE: tasks.filter((t: any) => t.priorite === 'MOYENNE').length,
          BASSE: tasks.filter((t: any) => t.priorite === 'BASSE').length
        },
        statusDistribution: {
          NON_COMMENCE: tasks.filter((t: any) => t.statut === 'NON_COMMENCE').length,
          EN_COURS: tasks.filter((t: any) => t.statut === 'EN_COURS').length,
          BLOQUE: tasks.filter((t: any) => t.statut === 'BLOQUE').length,
          TERMINE: tasks.filter((t: any) => t.statut === 'TERMINE').length
        }
      };

      // Traiter les données de l'équipe
      const teamAnalytics: TeamMemberAnalytics[] = users.map((user: any) => {
        const userTasks = tasks.filter((t: any) => t.assignedTo?.id === user.id);
        const completedTasks = userTasks.filter((t: any) => t.statut === 'TERMINE');
        
        return {
          id: user.id,
          username: user.username,
          nom: user.nom,
          email: user.email,
          totalTasks: userTasks.length,
          completedTasks: completedTasks.length,
          completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0,
          averageTaskTime: 0, // À calculer si on a des données de temps
          projects: projects
            .filter((p: any) => p.developpeurs?.some((d: any) => d.id === user.id))
            .map((p: any) => p.titre),
          department: user.department,
          jobTitle: user.jobTitle
        };
      });

      // Générer des données mensuelles (à adapter selon vos vraies données)
      const monthlyData: MonthlyAnalytics[] = this.generateMonthlyData(processedProjects, tasks);

      // Calculer la distribution des types de projets
      const projectTypeDistribution: ProjectTypeDistribution = {
        Delivery: processedProjects.filter(p => p.type === 'Delivery').length,
        TMA: processedProjects.filter(p => p.type === 'TMA').length,
        Interne: processedProjects.filter(p => p.type === 'Interne').length
      };

      // Calculer les résumés
      const summary = {
        totalProjects: processedProjects.length,
        activeProjects: processedProjects.filter(p => p.statut === 'EN_COURS').length,
        totalTasks: taskAnalytics.total,
        completedTasks: taskAnalytics.completed,
        totalHoursSold: processedProjects.reduce((sum, p) => sum + p.plannedHours, 0),
        totalHoursConsumed: processedProjects.reduce((sum, p) => sum + p.effectiveHours, 0),
        teamSize: teamAnalytics.length,
        averageCompletionRate: processedProjects.length > 0 
          ? Math.round(processedProjects.reduce((sum, p) => sum + p.progression, 0) / processedProjects.length)
          : 0
      };

      const result: DashboardAnalytics = {
        projects: processedProjects,
        tasks: taskAnalytics,
        team: teamAnalytics,
        monthlyData,
        projectTypeDistribution,
        summary
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      
      // Retourner des données par défaut en cas d'erreur
      return this.getDefaultAnalytics();
    }
  }

  public getDefaultAnalytics(): DashboardAnalytics {
    return {
      projects: [],
      tasks: {
        total: 0,
        completed: 0,
        inProgress: 0,
        blocked: 0,
        notStarted: 0,
        priorityDistribution: { ELEVEE: 0, MOYENNE: 0, BASSE: 0 },
        statusDistribution: { NON_COMMENCE: 0, EN_COURS: 0, BLOQUE: 0, TERMINE: 0 }
      },
      team: [],
      monthlyData: this.generateDefaultMonthlyData(),
      projectTypeDistribution: { Delivery: 0, TMA: 0, Interne: 0 },
      summary: {
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalHoursSold: 0,
        totalHoursConsumed: 0,
        teamSize: 0,
        averageCompletionRate: 0
      }
    };
  }

  private generateDefaultMonthlyData(): MonthlyAnalytics[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months.map(month => ({
      month,
      hoursSold: 0,
      hoursConsumed: 0,
      hoursRemaining: 0,
      projectsCount: 0,
      tasksCompleted: 0
    }));
  }

  async getProjectsByType(type: string): Promise<ProjectAnalytics[]> {
    try {
      const analytics = await this.getDashboardAnalytics();
      return analytics.projects.filter(p => p.type === type);
    } catch (error) {
      console.error(`Erreur lors de la récupération des projets de type ${type}:`, error);
      return [];
    }
  }

  async getTeamAnalytics(): Promise<TeamMemberAnalytics[]> {
    try {
      const analytics = await this.getDashboardAnalytics();
      return analytics.team;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics d\'équipe:', error);
      return [];
    }
  }

  async getTaskAnalytics(): Promise<TaskAnalytics> {
    try {
      const analytics = await this.getDashboardAnalytics();
      return analytics.tasks;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics de tâches:', error);
      return this.getDefaultAnalytics().tasks;
    }
  }

  async getMonthlyAnalytics(): Promise<MonthlyAnalytics[]> {
    try {
      const analytics = await this.getDashboardAnalytics();
      return analytics.monthlyData;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics mensuels:', error);
      return this.generateDefaultMonthlyData();
    }
  }

  async getProjectTypeDistribution(): Promise<ProjectTypeDistribution> {
    try {
      const analytics = await this.getDashboardAnalytics();
      return analytics.projectTypeDistribution;
    } catch (error) {
      console.error('Erreur lors de la récupération de la distribution des types de projets:', error);
      return { Delivery: 0, TMA: 0, Interne: 0 };
    }
  }

  private generateMonthlyData(projects: ProjectAnalytics[], tasks: any[]): MonthlyAnalytics[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthNumber = index + 1;
      const monthStart = new Date(currentYear, index, 1);
      const monthEnd = new Date(currentYear, index + 1, 0);
      
      // Filtrer les projets et tâches pour ce mois
      const monthProjects = projects.filter(p => {
        const projectDate = new Date(p.dateDebut);
        return projectDate >= monthStart && projectDate <= monthEnd;
      });
      
      const monthTasks = tasks.filter(t => {
        const taskDate = new Date(t.dateCreation || t.dateDebut);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });

      return {
        month,
        hoursSold: monthProjects.reduce((sum, p) => sum + p.plannedHours, 0),
        hoursConsumed: monthProjects.reduce((sum, p) => sum + p.effectiveHours, 0),
        hoursRemaining: monthProjects.reduce((sum, p) => sum + (p.plannedHours - p.effectiveHours), 0),
        projectsCount: monthProjects.length,
        tasksCompleted: monthTasks.filter(t => t.statut === 'TERMINE').length
      };
    });
  }

  // Méthode pour rafraîchir le cache
  clearCache(): void {
    this.cache.clear();
  }

  // Méthode pour forcer le rafraîchissement des données
  async refreshAnalytics(): Promise<DashboardAnalytics> {
    this.clearCache();
    return this.getDashboardAnalytics();
  }
}

export const analyticsService = new AnalyticsService();
