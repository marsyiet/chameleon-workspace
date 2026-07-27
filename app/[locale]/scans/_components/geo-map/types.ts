import { Asset } from "@/app/[locale]/scans/_constants/data-types"

export type MarkerKind = "asset" | "site"

export interface MapPoint {
  id: string
  label: string
  sublabel?: string
  coords: [number, number]
  kind: MarkerKind
  assetType?: string
  severity?: Asset["severity"]
  assetCount?: number
}