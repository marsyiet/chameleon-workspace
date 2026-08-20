import { getChanges } from "@/services/changes/changes-services"
import { useQuery } from "@tanstack/react-query"

export function useChanges(params: {
  page: number
  limit: number
  organizationId?: string
  assetId?: string
  scanId?: string
  type?: string
}) {
  return useQuery({
    queryKey: ["changes", params],
    queryFn: () => getChanges(params),
  })
}