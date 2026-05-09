export type TransactionType = "INCOME" | "EXPENSE";

export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  categoryId: number;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  type: TransactionType;
  amount: number;
  note: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  categoryId: number;
  type: TransactionType;
  amount: number;
  note?: string;
  transactionDate: string;
}

export interface UpdateTransactionRequest {
  categoryId?: number;
  type?: TransactionType;
  amount?: number;
  note?: string;
  transactionDate?: string;
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
