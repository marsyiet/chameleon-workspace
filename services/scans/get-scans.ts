import { api } from "@/lib/axios"

export async function getScans(
  page = 1,
  limit = 10
) {
  const response =
    await api.get(
      `/scans?page=${page}&limit=${limit}`
    )

  return response.data
}