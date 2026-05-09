import type { TransactionType } from "@/features/finance/types";

export interface GenerateRequest {
  prompt: string;
}

export interface GenerateResponse {
  response: string;
}

export interface SuggestCategoryRequest {
  note: string;
  type: TransactionType;
}

export interface SuggestCategoryResponse {
  categoryId: number | null;
  categoryName: string | null;
}
