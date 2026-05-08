export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export interface GoalResponse {
  id: number;
  title: string;
  description: string;
  targetDate: string;
  status: GoalStatus;
  createdAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  targetDate: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  targetDate?: string;
  status?: GoalStatus;
}
