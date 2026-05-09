import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getMoodTrend,
} from "./service";

export const noteKeys = {
  all: ["notes"] as const,
  list: (page: number, size: number, q: string) =>
    ["notes", "list", page, size, q] as const,
  detail: (id: number) => ["notes", "detail", id] as const,
  moodTrend: (days: number) => ["notes", "mood-trend", days] as const,
};

export function useMoodTrend(days = 30) {
  return useQuery({
    queryKey: noteKeys.moodTrend(days),
    queryFn: () => getMoodTrend(days),
  });
}

export function useNotes(page = 0, size = 12, q = "") {
  return useQuery({
    queryKey: noteKeys.list(page, size, q),
    queryFn: () => getNotes(page, size, q || undefined),
    placeholderData: (prev) => prev,
  });
}

export function useNote(id: number) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => getNote(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  });
}

export function useUpdateNote(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateNote>[1]) =>
      updateNote(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.all });
      qc.invalidateQueries({ queryKey: noteKeys.detail(id) });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  });
}
