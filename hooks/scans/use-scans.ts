"use client"

import { useQuery } from "@tanstack/react-query"

import { getScans } from "@/services/scans/get-scans"

export function useScans(
  page = 1,
  limit = 10
) {
  return useQuery({
    queryKey: [
      "scans",
      page,
      limit,
    ],
    queryFn: () =>
      getScans(
        page,
        limit
      ),
  })
}