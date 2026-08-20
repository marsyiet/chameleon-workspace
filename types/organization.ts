export interface DeclaredApp {
  name: string
  criticality?: string
  description?: string
}

export interface DeclaredPerimeter {
  domains: string[]
  internalRanges: string[]
  providers: string[]
  apps: DeclaredApp[]
}

export interface Organization {
  _id: string
  name: string
  description?: string | null
  sector?: string | null
  status: string
  geo: {
    city?: string | null
    lat?: number | null
    lon?: number | null
  }
  declaredPerimeter: DeclaredPerimeter
  createdAt: string
  updatedAt: string
}

export interface OrganizationStats {
  assetsCount: number
  scansCount: number
  criticalAssetsCount: number
}