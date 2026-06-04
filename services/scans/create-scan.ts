import { api } from "@/lib/axios"

import {
  CreateScanFormValues,
} from "@/app/[locale]/scans/_validators/create-scan-schema"

export async function createScan(
  data: CreateScanFormValues
) {
  const response =
    await api.post(
      "/scans/",
      data
    )

  return response.data
}