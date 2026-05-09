"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api";
import { useExportData, useImportData } from "../hooks";
import type { ExportPayload, ImportSummary } from "../types";

function summaryText(s: ImportSummary): string {
  return `Imported ${s.categories} categories, ${s.habits} habits, ${s.transactions} transactions, ${s.budgets} budgets, ${s.recurring} recurring, ${s.notes} notes, ${s.goals} goals.`;
}

export function DataSection() {
  const exportMut = useExportData();
  const importMut = useImportData();
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    exportMut.mutate(undefined, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rm-diagram-export-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      onError: (err) => setError(getApiErrorMessage(err) || "Export failed"),
    });
  }

  async function handleImportFile(file: File) {
    setError(null);
    setSummary(null);
    let payload: ExportPayload;
    try {
      payload = JSON.parse(await file.text()) as ExportPayload;
    } catch {
      setError("File is not valid JSON");
      return;
    }
    importMut.mutate(payload, {
      onSuccess: (s) => setSummary(summaryText(s)),
      onError: (err) => setError(getApiErrorMessage(err) || "Import failed"),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data export & import</CardTitle>
        <CardDescription>
          Download a full JSON snapshot of your account, or restore one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMut.isPending}
          >
            {exportMut.isPending ? "Exporting…" : "Export all data"}
          </Button>
          <label
            className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent ${
              importMut.isPending ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {importMut.isPending ? "Importing…" : "Import from JSON"}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              disabled={importMut.isPending}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        {summary && <p className="text-xs text-green-600">{summary}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="text-[10px] text-muted-foreground">
          Import is additive — it appends to your existing data and skips
          duplicate categories/budgets.
        </p>
      </CardContent>
    </Card>
  );
}
