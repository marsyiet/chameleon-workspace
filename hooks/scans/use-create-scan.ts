"use client"

import { useMutation } from "@tanstack/react-query"

import { createScan } from "@/services/scans/create-scan"

export function useCreateScan() {
  return useMutation({
    mutationFn: createScan,
  })
}