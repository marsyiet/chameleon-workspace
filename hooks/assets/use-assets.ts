import { useQuery } from "@tanstack/react-query"
import { getAssets } from "@/services/assets/get-assets"

interface Options {
  enabled?: boolean
}

export function useAssets(scanId: string, options?: Options) {
  return useQuery({
    queryKey: ["assets", scanId],
    queryFn: () => getAssets(scanId),
    enabled: options?.enabled !== false && !!scanId,
  })
}