// hooks/scans/use-delete-scan.ts
"use client"
import { deleteScan } from "@/services/scans/detele-scan"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] })
    },
  })
}