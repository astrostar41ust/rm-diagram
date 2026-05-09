import { api } from "@/lib/api";
import type {
  NoteResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  PageResponse,
} from "./types";

export async function getNotes(
  page = 0,
  size = 12,
  q?: string,
): Promise<PageResponse<NoteResponse>> {
  const res = await api.get<PageResponse<NoteResponse>>("/api/v1/notes", {
    params: { page, size, ...(q ? { q } : {}) },
  });
  return res.data;
}

export async function getNote(id: number): Promise<NoteResponse> {
  const res = await api.get<NoteResponse>(`/api/v1/notes/${id}`);
  return res.data;
}

export async function createNote(
  data: CreateNoteRequest,
): Promise<NoteResponse> {
  const res = await api.post<NoteResponse>("/api/v1/notes", data);
  return res.data;
}

export async function updateNote(
  id: number,
  data: UpdateNoteRequest,
): Promise<NoteResponse> {
  const res = await api.patch<NoteResponse>(`/api/v1/notes/${id}`, data);
  return res.data;
}

export async function deleteNote(id: number): Promise<void> {
  await api.delete(`/api/v1/notes/${id}`);
}
