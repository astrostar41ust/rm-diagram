export type Mood = "GREAT" | "GOOD" | "OKAY" | "BAD";

export interface NoteResponse {
  id: number;
  title: string;
  content: string;
  mood: Mood | null;
  tags: string | null;
  noteDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  mood?: Mood;
  tags?: string;
  noteDate?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  mood?: Mood;
  tags?: string;
  noteDate?: string;
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

export interface MoodPoint {
  date: string;
  mood: Mood;
  count: number;
}

export interface MoodTrendResponse {
  windowDays: number;
  totalEntries: number;
  averageScore: number;
  points: MoodPoint[];
}
