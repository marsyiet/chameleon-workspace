export interface Change {
  _id: string
  type: string
  summary: string
  field?: string
  oldValue?: unknown
  newValue?: unknown
  assetId?: string | null
  ipAddress?: string | null
  organizationId?: string | null
  scanId: string
  detectedAt: string
}