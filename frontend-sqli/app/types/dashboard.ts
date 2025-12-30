// Types partagés pour les dashboards
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  teamMembers: number;
  averageCompletionRate: number;
  monthlyGrowth?: number;
  weeklyTasksCompleted?: number;
  upcomingDeadlines?: number;
}

export interface ProjectOverview {
  id: number;
  titre: string;
  description: string;
  type: string;
  statut: string;
  progression: number;
  dateDebut: string;
  dateFin: string;
  client: { username: string; email: string };
  developpeurs: Array<{ id: number; username: string; role: string }>;
  tasks: Array<{ id: number; titre: string; statut: string; dateFin: string }>;
  isOverdue: boolean;
  daysUntilDeadline: number;
}

export interface TaskOverview {
  id: number;
  titre: string;
  description: string;
  statut: string;
  priorite: string;
  dateDebut: string;
  dateFin: string;
  developpeur: { username: string; email: string };
  project: { titre: string; id: number };
  plannedHours: number;
  effectiveHours: number;
  isOverdue: boolean;
  daysUntilDeadline: number;
}

export interface TeamMemberOverview {
  id: number;
  username: string;
  email: string;
  role: string;
  jobTitle: string;
  department: string;
  assignedProjects: number;
  completedTasks: number;
  pendingTasks: number;
  availability: number;
  workload: number;
  lastActivity: string;
}

export interface RecentActivity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  entityType: string;
  entityId: number;
  user: { username: string; id: number };
}

export interface ProjectProgress {
  projectId: number;
  titre: string;
  progression: number;
  completedTasks: number;
  totalTasks: number;
  color: string;
}

export interface TaskStatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface WorkloadAnalysis {
  memberId: number;
  username: string;
  currentWorkload: number;
  maxCapacity: number;
  utilization: number;
  projects: Array<{ id: number; titre: string; workload: number }>;
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
}
