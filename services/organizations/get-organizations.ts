// services/organizations/get-organizations.ts
import { api } from "@/lib/axios"

export async function getOrganizations() {
  const res = await api.get("/organizations")
  const payload = res.data

  if (Array.isArray(payload?.data?.organizations)) return payload.data.organizations
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload

  console.warn("Réponse /organizations inattendue, forme reçue :", payload)
  return []
}