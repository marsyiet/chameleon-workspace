"use client"

import { useQuery } from "@tanstack/react-query"
import { getScans } from "@/services/scans/get-scans"

export function useScans(
  page  = 1,
  limit = 10,
  search = ""
) {
  return useQuery({
    queryKey: ["scans", page, limit, search],
    queryFn:  () => getScans(page, limit, search),
    placeholderData: (prev) => prev, // garde les données précédentes pendant le chargement
  })
}