"use client"

import { useParams } from "next/navigation"
import { useScan } from "@/hooks/scans/use-scan"
import PendingScanView from "../_components/pending-scan-view"
import ScanResultsView from "./_components/scan-results-view"
import { useAssets } from "@/hooks/assets/use-assets"

export default function ScanPage() {
  const params = useParams()
  const scanId = params.scan as string

  const { data: scanData, isLoading: scanLoading } = useScan(scanId)
  const scan = scanData?.data ?? scanData

  const { data: assetsData, isLoading: assetsLoading } = useAssets(scanId, {
    enabled: scan?.status === "completed",
  })
  const assets = assetsData ?? []

  if (scanLoading) return <div>Loading...</div>
  if (!scan) return <div>Not found</div>

  if (scan.status === "pending" || scan.status === "running") {
    return <PendingScanView scan={scan} />
  }

  return (
    <ScanResultsView
      scan={scan}
      assets={assets}
    />
  )
}