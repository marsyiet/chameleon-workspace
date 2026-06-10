import { api } from "@/lib/axios"

export async function getScans(
  page   = 1,
  limit  = 10,
  search = ""
) {
  const response = await api.get("/scans", {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
    },
  })
  return response.data
}