import { Asset } from "@/app/[locale]/scans/_constants/data-types"
import { api } from "@/lib/axios"

export async function getInventoryAssets(): Promise<Asset[]> {
  const res = await api.get("/assets", {
    params: { page: 1, limit: 1000 },
  })
  const payload = res.data

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.assets)) return payload.data.assets
  if (Array.isArray(payload?.assets)) return payload.assets

  console.warn("Réponse /assets inattendue, forme reçue :", payload)
  return []
}