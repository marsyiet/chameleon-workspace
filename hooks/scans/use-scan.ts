"use client"

import { useQuery } from "@tanstack/react-query"

import { getScan } from "@/services/scans/get-scan"

export function useScan(
  scanId: string
) {
  return useQuery({
    queryKey: [
      "scan",
      scanId,
    ],
    queryFn: () =>
      getScan(scanId),
    enabled: !!scanId,
    refetchInterval: 5000,
  })
}