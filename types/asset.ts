export interface AssetCVE {
  id: string
  description: string
  cvss: number | null
  epss: number | null
  status: "valid" | "mitigated"
}

export interface AssetService {
  port: number
  protocol: string
  state: string
  service?: string
  product?: string
  version?: string
  banner?: string
  cves: AssetCVE[]
}

export interface AssetLoginPoint {
  url: string
  type: "basic" | "form" | "sso"
  confidence: "certaine" | "probable"
}

export interface AssetContactForm {
  url: string
  fieldsDetected: string[]
}

export interface Asset {
  _id: string
  organizationId: string | null
  scanId: string
  siteId: string | null

  ipAddress: string
  hostname: string | null
  rootDomain: string | null
  rdns: string
  os: string | null

  attribution: {
    guessedOrganizationName: string | null
    confidence: "certaine" | "probable" | "inconnue"
    signals: string[]
  }

  exposure: "externe" | "interne" | "unknown"
  assetType:
    | "web"
    | "database"
    | "api"
    | "remote-access"
    | "mail"
    | "authentication"
    | "network"
    | "unknown"
  humanVector: {
    exposed: boolean
    matchedAt: string | null
    source: string | null
  }
  severity: "critical" | "high" | "medium" | "low" | "informational"
  detectionConfidence: "certaine" | "probable"

  geo: {
    country: string | null
    city: string | null
    lat: number | null
    lon: number | null
  }
  asn: {
    asn: string | null
    org: string | null
    isp: string | null
  }
  tags: string[]

  http: {
    title: string | null
    statusCode: number | null
    technologies: string[]
    faviconUrl: string | null
    faviconHash: number | null
    screenshotUrl: string | null
    redirectChain: string[]
    loginPoints: AssetLoginPoint[]
    contactForms: AssetContactForm[]
  }

  tls: {
    issuer: string | null
    subject: string | null
    san: string[]
    validFrom: string | null
    validTo: string | null
    expired: boolean | null
    signatureAlgorithm: string | null
    selfSigned: boolean | null
  }

  networkDevice: {
    vendor: string | null
    sysDescr: string | null
    adminInterfaceDetected: string | null
    snmpExposed: boolean | null
  }

  api: {
    specFound: string | null
    authType: string | null
    endpointsDiscovered: string[]
  }

  detectedCapabilities: string[]
  services: AssetService[]

  riskScore: {
    value: number
    cvssMax: number | null
    epssMax: number | null
    criticality: number | null
    humanVectorFactor: number
    calculatedAt: string | null
  }

  status: "active" | "inactive"
  firstSeenAt: string
  lastSeenAt: string
  isDeleted: boolean
  updatedAt: string
}