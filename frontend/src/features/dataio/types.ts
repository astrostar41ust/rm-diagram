// Mirrors com.rmdiagram.dataio.DataIoDto on the backend. The export payload is
// intentionally kept loose here — the frontend just round-trips it as JSON.

export interface ExportPayload {
  version: string;
  exportedAt: string;
  // The remaining fields are server-shaped; we deliberately keep them opaque
  // so the frontend never has to mirror the entire schema.
  [key: string]: unknown;
}

export interface ImportSummary {
  categories: number;
  habits: number;
  transactions: number;
  budgets: number;
  recurring: number;
  notes: number;
  goals: number;
}
