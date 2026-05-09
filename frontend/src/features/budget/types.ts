export type BudgetStatus = "OK" | "WARNING" | "OVER";

export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  monthlyLimit: number;
  currentSpending: number;
  remaining: number;
  percentUsed: number;
  alertThreshold: number;
  status: BudgetStatus;
  baseCurrency: string;
}

export interface CreateBudgetRequest {
  categoryId: number;
  monthlyLimit: number;
  alertThreshold?: number;
}

export interface UpdateBudgetRequest {
  monthlyLimit?: number;
  alertThreshold?: number;
}
