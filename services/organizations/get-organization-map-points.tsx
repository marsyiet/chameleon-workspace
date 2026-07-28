import { api } from "@/lib/axios"

export interface OrganizationMapPoint {
  _id: string
  name: string
  geo: { city: string | null; lat: number | null; lon: number | null }
  assetCount: number
}

export async function getOrganizationMapPoints(): Promise<OrganizationMapPoint[]> {
  const res = await api.get("/organizations/map")
  const payload = res.data

  if (Array.isArray(payload?.data?.organizations)) return payload.data.organizations
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload

  console.warn("Réponse /organizations/map inattendue, forme reçue :", payload)
  return []
}