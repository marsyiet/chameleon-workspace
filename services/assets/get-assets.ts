// services/assets/get-assets.ts
import { api } from "@/lib/axios"

export async function getAssets(scanId: string) {
  const response = await api.get(`/assets`, {
    params: { scanId },
  })
  console.log(response)
  return response.data.data.assets
}
