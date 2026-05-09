export type Mood = "GREAT" | "GOOD" | "OKAY" | "BAD";

export interface NoteResponse {
  id: number;
  title: string;
  content: string;
  mood: Mood | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  mood?: Mood;
  tags?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  mood?: Mood;
  tags?: string;
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
