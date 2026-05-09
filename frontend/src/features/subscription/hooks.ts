import { useMemo } from "react";
import { addDays, isBefore, parseISO } from "date-fns";
import { useRecurring } from "@/features/recurring/hooks";
import { useSettings } from "@/features/settings/hooks";
import type { RecurringTransaction } from "@/features/recurring/types";
import type { SubscriptionListView } from "./types";

/**
 * Subscription view is a derived view over recurring transactions:
 * filter to active EXPENSE rules and roll up totals.
 *
 * Currency conversion is intentionally simple — recurring rules' amounts are
 * stored in their own currency; we sum amounts only when they match the user's
 * base currency, otherwise display them per-rule unconverted in the list.
 */
export function useSubscriptions(): {
  data: SubscriptionListView | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const { data: recurring, isLoading, isError } = useRecurring();
  const { data: settings } = useSettings();
  const base = settings?.currency ?? "THB";

  const data = useMemo<SubscriptionListView | undefined>(() => {
    if (!recurring) return undefined;
    const subs = recurring.filter(
      (r) => r.active && r.type === "EXPENSE",
    );
    const today = new Date();
    const inAWeek = addDays(today, 7);
    const upcoming = subs.filter((r) => {
      const next = parseISO(r.nextRunDate);
      return isBefore(next, inAWeek);
    });

    const byFrequency: Record<"DAILY" | "WEEKLY" | "MONTHLY", number> = {
      DAILY: 0,
      WEEKLY: 0,
      MONTHLY: 0,
    };
    let totalMonthly = 0;
    for (const r of subs) {
      byFrequency[r.frequency] = (byFrequency[r.frequency] ?? 0) + 1;
      if (r.currency !== base) continue;
      totalMonthly += monthlyEquivalent(r);
    }

    return {
      summary: {
        totalMonthly,
        baseCurrency: base,
        count: subs.length,
        upcomingThisWeek: upcoming,
        byFrequency,
      },
      subscriptions: [...subs].sort(
        (a, b) => monthlyEquivalent(b) - monthlyEquivalent(a),
      ),
    };
  }, [recurring, base]);

  return { data, isLoading, isError };
}

function monthlyEquivalent(r: RecurringTransaction): number {
  if (r.frequency === "MONTHLY") return r.amount;
  if (r.frequency === "WEEKLY") return r.amount * 4.33;
  return r.amount * 30;
}
