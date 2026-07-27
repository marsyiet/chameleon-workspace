// services/assets/get-asset.ts
import { api } from "@/lib/axios"
import { Asset } from "@/app/[locale]/scans/_constants/data-types"

export async function getAsset(assetId: string): Promise<Asset> {
  const res = await api.get(`/assets/${assetId}`)
  return res.data.data
}