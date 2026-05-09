import type { RecurringTransaction } from "@/features/recurring/types";

export interface SubscriptionSummary {
  /** Total monthly cost in the user's base currency. */
  totalMonthly: number;
  baseCurrency: string;
  count: number;
  upcomingThisWeek: RecurringTransaction[];
  byFrequency: Record<"DAILY" | "WEEKLY" | "MONTHLY", number>;
}

export interface SubscriptionListView {
  summary: SubscriptionSummary;
  subscriptions: RecurringTransaction[];
}
