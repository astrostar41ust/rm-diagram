export interface NoteResponse {
  id: number;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  date: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}
