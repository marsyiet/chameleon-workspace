import { api } from "@/lib/axios"

export async function getScan(
  scanId: string
) {
  const response = await api.get(
    `/scans/${scanId}`
  )

  return response.data
}