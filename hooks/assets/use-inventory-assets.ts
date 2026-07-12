import { getInventoryAssets } from "@/services/assets/get-inventory-assets"
import { useQuery } from "@tanstack/react-query"

interface Options {
  enabled?: boolean
}

export function useInventoryAssets(options?: Options) {
  return useQuery({
    queryKey: ["assets", "inventory"],
    queryFn: () => getInventoryAssets(),
    enabled: options?.enabled !== false,
  })
}