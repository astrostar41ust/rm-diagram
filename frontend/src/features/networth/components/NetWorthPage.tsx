"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Banknote,
  Camera,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useDeleteAccount,
  useNetWorth,
  useSnapshotToday,
} from "../hooks";
import type { Account, NetWorthSnapshot } from "../types";
import { AddAccountSheet } from "./AddAccountSheet";

function format2(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function HistoryChart({
  history,
  currency,
}: {
  history: NetWorthSnapshot[];
  currency: string;
}) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Snapshot today to start tracking your net worth over time.
      </p>
    );
  }
  const max = Math.max(...history.map((h) => h.netWorth), 1);
  const min = Math.min(...history.map((h) => h.netWorth), 0);
  const range = Math.max(max - min, 1);
  const recent = history.slice(-30);
  return (
    <div>
      <div className="flex items-end gap-1">
        {recent.map((h) => {
          const norm = (h.netWorth - min) / range;
          const height = Math.max(4, norm * 100);
          return (
            <div
              key={h.snapshotOn}
              className="flex flex-1 flex-col items-center gap-1"
              title={`${h.snapshotOn}: ${format2(h.netWorth)} ${currency}`}
            >
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-sm bg-primary"
                  style={{ height: `${height}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        <span>{format(parseISO(recent[0].snapshotOn), "MMM d")}</span>
        <span>
          {format(parseISO(recent[recent.length - 1].snapshotOn), "MMM d")}
        </span>
      </div>
    </div>
  );
}

function AccountRow({
  account,
  onDelete,
}: {
  account: Account;
  onDelete: () => void;
}) {
  const liability =
    account.type === "CREDIT" || account.type === "LIABILITY";
  return (
    <li className="group flex items-center gap-3 px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Banknote className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{account.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {account.type.toLowerCase()}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            liability ? "text-red-500" : "text-green-600",
          )}
        >
          {liability ? "-" : ""}
          {format2(account.balance)}{" "}
          <span className="text-[10px] font-normal text-muted-foreground">
            {account.currency}
          </span>
        </p>
        {account.currency !== account.baseCurrency && (
          <p className="text-[10px] text-muted-foreground">
            ≈ {format2(account.balanceInBase)} {account.baseCurrency}
          </p>
        )}
      </div>
      <button
        onClick={onDelete}
        aria-label="Delete account"
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

export function NetWorthPage() {
  const { data, isLoading, isError } = useNetWorth();
  const del = useDeleteAccount();
  const snap = useSnapshotToday();
  const [addOpen, setAddOpen] = useState(false);

  function handleDelete(a: Account) {
    if (!window.confirm(`Delete account "${a.name}"?`)) return;
    del.mutate(a.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Net worth</h1>
          <p className="text-muted-foreground">
            Accounts and the line that runs through them.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => snap.mutate()}
            disabled={snap.isPending}
          >
            <Camera className="size-4" data-icon="inline-start" />
            {snap.isPending ? "Saving…" : "Snapshot today"}
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            Add account
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-sm text-destructive">Failed to load.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="size-4 text-green-500" />
                  Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {format2(data.assets)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {data.baseCurrency}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingDown className="size-4 text-red-500" />
                  Liabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {format2(data.liabilities)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {data.baseCurrency}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Banknote className="size-4 text-primary" />
                  Net worth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-2xl font-semibold tabular-nums",
                    data.netWorth < 0 ? "text-red-500" : "",
                  )}
                >
                  {format2(data.netWorth)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {data.baseCurrency}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryChart
                history={data.history}
                currency={data.baseCurrency}
              />
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-2 text-sm font-medium">
              Accounts
            </div>
            {data.accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No accounts yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="size-4" data-icon="inline-start" />
                  Add your first account
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.accounts.map((a) => (
                  <AccountRow
                    key={a.id}
                    account={a}
                    onDelete={() => handleDelete(a)}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <AddAccountSheet open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
