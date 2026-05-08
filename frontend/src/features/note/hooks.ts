import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "./service";

const keys = {
  all: ["notes"] as const,
  detail: (id: number) => ["notes", id] as const,
};

export function useNotes() {
  return useQuery({ queryKey: keys.all, queryFn: getNotes });
}

export function useNote(id: number) {
  return useQuery({ queryKey: keys.detail(id), queryFn: () => getNote(id) });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateNote(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateNote>[1]) =>
      updateNote(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
