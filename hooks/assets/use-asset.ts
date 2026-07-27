// hooks/assets/use-asset.ts
import { useQuery } from "@tanstack/react-query"
import { getAsset } from "@/services/assets/get-asset"

export function useAsset(assetId: string) {
  return useQuery({
    queryKey: ["assets", assetId],
    queryFn: () => getAsset(assetId),
    enabled: !!assetId,
  })
}