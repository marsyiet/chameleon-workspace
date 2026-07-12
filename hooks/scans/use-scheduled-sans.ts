import { api } from "@/lib/axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface ScheduledScan {
  id: string
  name: string
  description?: string
  scanType: "network" | "web" | "full"
  scheduledAt: string
  priority: number
  targets: { target: string; targetType: string }[]
}

export function useScheduledScans() {
  return useQuery({
    queryKey: ["scans", "scheduled"],
    queryFn: async () => {
      const res = await api.get("/scans/scheduled")
      return res.data.data as ScheduledScan[]
    },
  })
}

export function useReorderScheduledScans() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (scanIds: string[]) => {
      const res = await api.patch("/scans/reorder", { scanIds })
      return res.data
    },
    // mise à jour optimiste : on réordonne le cache avant la réponse serveur
    onMutate: async (scanIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["scans", "scheduled"] })
      const previous = queryClient.getQueryData<ScheduledScan[]>([
        "scans",
        "scheduled",
      ])

      if (previous) {
        const byId = new Map(previous.map((s) => [s.id, s]))
        const reordered = scanIds
          .map((id) => byId.get(id))
          .filter(Boolean) as ScheduledScan[]
        queryClient.setQueryData(["scans", "scheduled"], reordered)
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["scans", "scheduled"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["scans", "scheduled"] })
    },
  })
}