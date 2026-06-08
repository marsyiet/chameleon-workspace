export interface ScanTarget {
  id: string
  target: string
  targetType: string
  status: string
  startedAt: string | null
  completedAt: string | null
}

export interface Scan {
  _id: string
  organizationId: string
  createdBy: string

  name: string
  description: string

  scanType: "full" | "web"
  status:
    | "pending"
    | "running"
    | "completed"
    | "failed"

  progress: number
  assetsDiscovered: number

  targets: ScanTarget[]

  error: string | null

  startedAt: string | null
  completedAt: string | null

  isDeleted: boolean
  deletedAt: string | null

  createdAt: string
  updatedAt: string
}