export type SearchKind =
  | "HABIT"
  | "NOTE"
  | "TRANSACTION"
  | "GOAL"
  | "CATEGORY";

export interface SearchResult {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string | null;
  href: string;
}

export interface SearchResponse {
  total: number;
  results: SearchResult[];
}
