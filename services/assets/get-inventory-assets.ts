import { Asset } from "@/app/[locale]/scans/_constants/data-types"
import { api } from "@/lib/axios"

export async function getInventoryAssets(): Promise<Asset[]> {
  const res = await api.get("/assets")
  const payload = res.data

  // Gère plusieurs formes possibles de réponse selon comment l'endpoint a été implémenté :
  // - { data: [...] }
  // - { data: { assets: [...] } }
  // - { data: { scans: [...] } } (si jamais réutilisé par erreur du pattern scans)
  // - [...] directement
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.assets)) return payload.data.assets
  if (Array.isArray(payload?.assets)) return payload.assets

  console.warn("Réponse /assets inattendue, forme reçue :", payload)
  return []
}