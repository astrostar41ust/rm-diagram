export type GoalStatus = "ACTIVE" | "COMPLETED";
export type GoalLinkType = "NONE" | "HABIT" | "TRANSACTION";

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
  linkType: GoalLinkType;
  linkTargetId: number | null;
  targetValue: number | null;
  currentValue: number | null;
  progressLabel: string | null;
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
  linkType?: GoalLinkType;
  linkTargetId?: number;
  targetValue?: number;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  targetDate?: string;
  status?: GoalStatus;
  linkType?: GoalLinkType;
  linkTargetId?: number;
  targetValue?: number;
}
