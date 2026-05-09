export type GoalStatus = "ACTIVE" | "COMPLETED";

export interface Milestone {
  id: number;
  title: string;
  completed: boolean;
  sortOrder: number;
}

export interface Goal {
  id: number;
  title: string;
  description: string | null;
  status: GoalStatus;
  targetDate: string | null;
  sortOrder: number;
  progress: number;
  milestones: Milestone[];
  createdAt: string;
}

export interface CreateMilestoneRequest {
  title: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  targetDate?: string;
  milestones?: CreateMilestoneRequest[];
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  targetDate?: string;
  status?: GoalStatus;
}
