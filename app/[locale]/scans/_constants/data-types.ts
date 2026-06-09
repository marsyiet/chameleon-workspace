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

export interface Service {
  port: number
  protocol: string
  state: string
  service: string
  product: string
  version: string
  banner: string
}

export interface Cve {
  id: string
  description: string
  cvss: number | null
}

export interface Asset {
  _id: string
  ip: string
  rdns: string
  os: string | null
  openPorts: number[]
  services: Service[]
  tags: string[]
  geo: {
    country?: string
    city?: string
    latitude?: number
    longitude?: number
  }
  asn: {
    asn?: string
    org?: string
    isp?: string
  }
  cves: Cve[]
  http: {
    title?: string
    statusCode?: number
    server?: string
  }
  updatedAt: string
}

