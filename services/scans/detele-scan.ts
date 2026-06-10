// services/scans/delete-scan.ts
import { api } from "@/lib/axios"

export async function deleteScan(scanId: string) {
  const response = await api.delete(`/scans/${scanId}`)
  return response.data
}