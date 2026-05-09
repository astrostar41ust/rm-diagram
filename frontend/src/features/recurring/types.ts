import type { TransactionType } from "@/features/finance/types";

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface RecurringTransaction {
  id: number;
  categoryId: number;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  note: string | null;
  frequency: RecurrenceFrequency;
  dayOfMonth: number | null;
  dayOfWeek: DayOfWeek | null;
  nextRunDate: string;
  endDate: string | null;
  active: boolean;
}

export interface CreateRecurringRequest {
  categoryId: number;
  type: TransactionType;
  amount: number;
  currency?: string;
  note?: string;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number;
  dayOfWeek?: DayOfWeek;
  nextRunDate: string;
  endDate?: string;
}

export interface UpdateRecurringRequest extends Partial<CreateRecurringRequest> {
  active?: boolean;
}
