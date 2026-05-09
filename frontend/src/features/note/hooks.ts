import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "./service";

export const noteKeys = {
  all: ["notes"] as const,
  list: (page: number, size: number) =>
    ["notes", "list", page, size] as const,
  detail: (id: number) => ["notes", "detail", id] as const,
};

export function useNotes(page = 0, size = 12) {
  return useQuery({
    queryKey: noteKeys.list(page, size),
    queryFn: () => getNotes(page, size),
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
