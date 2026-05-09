import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exportData, importData } from "./service";

export function useExportData() {
  return useMutation({
    mutationFn: exportData,
  });
}

export function useImportData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importData,
    // After import, every server-state cache could be stale.
    onSuccess: () => qc.invalidateQueries(),
  });
}
