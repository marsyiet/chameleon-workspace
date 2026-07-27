import { MapPoint } from "./types"

// ---------------------------------------------------------------------------
// Tuiles et frontière
// ---------------------------------------------------------------------------

export const TILE_URL_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
export const TILE_URL_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

export const COUNTRIES_GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
export const CAMEROON_ISO3 = "CMR"

export const REGION_BOUNDS: [[number, number], [number, number]] = [
  [-2, 4],
  [16, 20],
]
export const CAMEROON_CENTER: [number, number] = [5.9, 12.7]
export const ASSET_DETAIL_ZOOM = 11

export const ASSET_DETAIL_BASE = "/fr/scans/inventory/asset"

// ---------------------------------------------------------------------------
// Palette carte (voile monde / mise en valeur Cameroun / contour)
// ---------------------------------------------------------------------------

export const DIM_COLOR_LIGHT = "rgba(24, 24, 27, 0.30)"
export const DIM_COLOR_DARK = "rgba(0, 0, 0, 0.50)"
export const HIGHLIGHT_COLOR_LIGHT = "rgba(255, 255, 255, 0.06)"
export const HIGHLIGHT_COLOR_DARK = "rgba(161, 161, 170, 0.10)"
export const OUTLINE_COLOR_LIGHT = "#52525b"
export const OUTLINE_COLOR_DARK = "#71717a"

// ---------------------------------------------------------------------------
// Icônes par type d'actif
// ---------------------------------------------------------------------------

export const ASSET_TYPE_ICONS: Record<string, string> = {
  database: `<path d="M12 8c4.418 0 8-1.343 8-3s-3.582-3-8-3-8 1.343-8 3 3.582 3 8 3Z"/><path d="M20 5v6c0 1.657-3.582 3-8 3s-8-1.343-8-3V5"/><path d="M20 11v6c0 1.657-3.582 3-8 3s-8-1.343-8-3v-6"/>`,
  web: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>`,
  "remote-access": `<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 20h8M12 17v3"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 6.5 9 6.5 9-6.5"/>`,
  network: `<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M5 8v2a4 4 0 0 0 4 4h1M19 8v2a4 4 0 0 1-4 4h-1"/>`,
  authentification: `<path d="M12 3 4 6.5v5c0 4.6 3.2 8.9 8 10 4.8-1.1 8-5.4 8-10v-5L12 3Z"/><path d="M9.5 12.5l1.8 1.8 3.2-3.6"/>`,
  unknown: `<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.2 2-2.4 3.5M12 17h.01"/>`,
}

export function assetTypeIconSvg(type: string | undefined): string {
  const inner = ASSET_TYPE_ICONS[type ?? "unknown"] ?? ASSET_TYPE_ICONS.unknown
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
}

export const assetTypeLabel: Record<string, string> = {
  database: "Base de données",
  web: "Web",
  "remote-access": "Accès distant",
  mail: "Messagerie",
  network: "Réseau",
  authentification: "Authentification",
  unknown: "Inconnu",
}

export const severityLabel: Record<string, string> = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
  informational: "Informationnel",
}

// ---------------------------------------------------------------------------
// Données de démonstration enrichies — réparties sur le territoire camerounais
// pour visualiser le comportement du clustering à différents niveaux de zoom
// ---------------------------------------------------------------------------

const ASSET_TYPES = ["web", "database", "mail", "remote-access", "network", "authentification"] as const
const SEVERITIES = ["critical", "high", "medium", "low", "informational"] as const

interface CityCluster {
  name: string
  center: [number, number] // [lat, lon]
  count: number
}

const CITY_CLUSTERS: CityCluster[] = [
  { name: "Yaoundé", center: [3.8480, 11.5021], count: 18 },
  { name: "Douala", center: [4.0511, 9.7085], count: 22 },
  { name: "Garoua", center: [9.3000, 13.4000], count: 6 },
  { name: "Bamenda", center: [5.9631, 10.1591], count: 8 },
  { name: "Maroua", center: [10.5910, 14.3159], count: 5 },
  { name: "Bafoussam", center: [5.4737, 10.4176], count: 7 },
  { name: "Ngaoundéré", center: [7.3167, 13.5833], count: 4 },
  { name: "Bertoua", center: [4.5833, 13.6833], count: 3 },
  { name: "Ebolowa", center: [2.9167, 11.1500], count: 3 },
  { name: "Kribi", center: [2.9500, 9.9167], count: 4 },
  { name: "Buea", center: [4.1560, 9.2418], count: 5 },
  { name: "Limbe", center: [4.0225, 9.2136], count: 3 },
]

const HOSTNAME_PREFIXES = [
  "srv-web", "api", "vpn", "mail", "db-prod", "gateway", "portal",
  "sso", "ftp", "backup", "cdn", "proxy", "ns1", "smtp", "webmail",
]

const ORG_DOMAINS = [
  "minfi.gov.cm", "minsante.gov.cm", "mineduc.gov.cm", "douanes.cm",
  "camtel.cm", "impots.cm",
]

// Décalage aléatoire mais déterministe autour d'un centre de ville, pour
// éviter que tous les points d'une même ville se superposent exactement
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return (x - Math.floor(x)) - 0.5
}

function buildOverviewMockPoints(): MapPoint[] {
  const points: MapPoint[] = []
  let idx = 0

  CITY_CLUSTERS.forEach((city) => {
    for (let i = 0; i < city.count; i++) {
      const seed = idx * 7.13
      const lat = city.center[0] + jitter(seed) * 0.3
      const lon = city.center[1] + jitter(seed + 1.7) * 0.3
      const assetType = ASSET_TYPES[idx % ASSET_TYPES.length]
      const severity = SEVERITIES[(idx * 3) % SEVERITIES.length]
      const prefix = HOSTNAME_PREFIXES[idx % HOSTNAME_PREFIXES.length]
      const domain = ORG_DOMAINS[idx % ORG_DOMAINS.length]

      points.push({
        id: `demo-asset-${idx}`,
        label: `${prefix}-${idx}.${domain}`,
        sublabel: `${city.name}, Cameroun (Démo)`,
        coords: [lat, lon],
        kind: "asset",
        assetType,
        severity,
      })
      idx++
    }
  })

  return points
}

export const MOCK_OVERVIEW_POINTS: MapPoint[] = buildOverviewMockPoints()

export const MOCK_ORGANIZATIONAL_POINTS: MapPoint[] = [
  {
    id: "demo-site-1",
    label: "Hôtel des Finances (Services Centraux)",
    sublabel: "Yaoundé (Démo)",
    coords: [3.8480, 11.5021],
    kind: "site",
    assetCount: 18,
  },
  {
    id: "demo-site-2",
    label: "Direction Régionale du Littoral",
    sublabel: "Douala (Démo)",
    coords: [4.0511, 9.7085],
    kind: "site",
    assetCount: 22,
  },
  {
    id: "demo-site-3",
    label: "Secteur des Douanes du Nord",
    sublabel: "Garoua (Démo)",
    coords: [9.3000, 13.4000],
    kind: "site",
    assetCount: 6,
  },
  {
    id: "demo-site-4",
    label: "Antenne Régionale Nord-Ouest",
    sublabel: "Bamenda (Démo)",
    coords: [5.9631, 10.1591],
    kind: "site",
    assetCount: 8,
  },
  {
    id: "demo-site-5",
    label: "Antenne Régionale Extrême-Nord",
    sublabel: "Maroua (Démo)",
    coords: [10.5910, 14.3159],
    kind: "site",
    assetCount: 5,
  },
  {
    id: "demo-site-6",
    label: "Antenne Régionale Ouest",
    sublabel: "Bafoussam (Démo)",
    coords: [5.4737, 10.4176],
    kind: "site",
    assetCount: 7,
  },
  {
    id: "demo-site-7",
    label: "Antenne Régionale Adamaoua",
    sublabel: "Ngaoundéré (Démo)",
    coords: [7.3167, 13.5833],
    kind: "site",
    assetCount: 4,
  },
  {
    id: "demo-site-8",
    label: "Antenne Régionale Est",
    sublabel: "Bertoua (Démo)",
    coords: [4.5833, 13.6833],
    kind: "site",
    assetCount: 3,
  },
  {
    id: "demo-site-9",
    label: "Antenne Régionale Sud",
    sublabel: "Ebolowa (Démo)",
    coords: [2.9167, 11.1500],
    kind: "site",
    assetCount: 3,
  },
  {
    id: "demo-site-10",
    label: "Poste Douanier de Kribi",
    sublabel: "Kribi (Démo)",
    coords: [2.9500, 9.9167],
    kind: "site",
    assetCount: 4,
  },
  {
    id: "demo-site-11",
    label: "Antenne Régionale Sud-Ouest",
    sublabel: "Buea (Démo)",
    coords: [4.1560, 9.2418],
    kind: "site",
    assetCount: 5,
  },
]