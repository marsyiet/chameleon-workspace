// services/changes/changes-service.ts
import { api } from "@/lib/axios"

export async function getChanges(params: {
  page: number
  limit: number
  organizationId?: string
  assetId?: string
  scanId?: string
  type?: string
}) {
  const res = await api.get("/changes", { params })
  return res.data
}