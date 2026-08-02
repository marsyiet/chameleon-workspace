import { AssetFilters } from "@/app/[locale]/scans/inventory/_components/asset-filters";

// Mappe chaque "field" reconnu dans la barre vers son groupe de facette + valeur
const FIELD_TO_FACET: Record<string, { group: string; value: string }> = {
  "role:router": { group: "role", value: "network_device" },
  "role:web": { group: "role", value: "web_app" },
  "role:database": { group: "role", value: "database" },
  "role:mail": { group: "role", value: "mail_server" },
  "tls:true": { group: "security", value: "has_tls" },
  "auth:true": { group: "security", value: "has_auth_surface" },
  "severity:critical": { group: "severity", value: "critical" },
  "severity:high": { group: "severity", value: "high" },
  "severity:medium": { group: "severity", value: "medium" },
  "severity:low": { group: "severity", value: "low" },
}

export function parseAssetQuery(raw: string): {
  freeText: string
  filters: AssetFilters
} {
  const tokens = raw.trim().split(/\s+/).filter(Boolean)
  const filters: AssetFilters = {}
  const freeTextTokens: string[] = []

  for (const token of tokens) {
    const lower = token.toLowerCase()
    const match = FIELD_TO_FACET[lower]

    if (match) {
      filters[match.group] = [...(filters[match.group] ?? []), match.value]
    } else {
      freeTextTokens.push(token)
    }
  }

  return { freeText: freeTextTokens.join(" "), filters }
}