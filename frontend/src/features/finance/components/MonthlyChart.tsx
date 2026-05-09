"use client";

import { useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useMonthlySummary } from "../hooks";

const INCOME_COLOR = "#22c55e";
const EXPENSE_COLOR = "#ef4444";
const ALL_MONTHS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

interface ChartRow {
  month: string;
  income: number;
  expense: number;
}

function formatCompact(value: number) {
  return value.toLocaleString(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

export function MonthlyChart() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data: summaries = [], isLoading, isError } = useMonthlySummary(year);

  const chartData = useMemo<ChartRow[]>(() => {
    const byMonth = new Map(summaries.map((s) => [s.month, s]));
    return ALL_MONTHS.map((mm) => {
      const key = `${year}-${mm}`;
      const s = byMonth.get(key);
      return {
        month: format(parse(key, "yyyy-MM", new Date()), "MMM"),
        income: s?.totalIncome ?? 0,
        expense: s?.totalExpense ?? 0,
      };
    });
  }, [summaries, year]);

  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, r) => ({
          income: acc.income + r.income,
          expense: acc.expense + r.expense,
        }),
        { income: 0, expense: 0 },
      ),
    [chartData],
  );

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">Income vs expense</h2>
          <p className="text-xs text-muted-foreground">By month, {year}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous year"
            onClick={() => setYear((y) => y - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[3rem] text-center text-xs font-medium">
            {year}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next year"
            onClick={() => setYear((y) => y + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex gap-4 text-xs">
          <div>
            <p className="text-muted-foreground">Total income</p>
            <p className="font-semibold text-green-600 tabular-nums">
              {totals.income.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total expense</p>
            <p className="font-semibold text-red-500 tabular-nums">
              {totals.expense.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center text-sm text-destructive">
              Failed to load summary.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompact}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value);
                    return Number.isFinite(n)
                      ? n.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "";
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "0.75rem" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill={INCOME_COLOR}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill={EXPENSE_COLOR}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
