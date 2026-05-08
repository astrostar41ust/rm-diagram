export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionResponse {
  id: number;
  amount: string;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  amount: string;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
}

export interface UpdateTransactionRequest {
  amount?: string;
  type?: TransactionType;
  category?: string;
  description?: string;
  date?: string;
}

export interface TransactionSummary {
  totalIncome: string;
  totalExpenses: string;
  netBalance: string;
}
