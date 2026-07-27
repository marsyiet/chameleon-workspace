"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Info, Eye } from "lucide-react"

import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { Asset } from "@/types/asset"
import { useOrganizationSites } from "@/hooks/use-organization-sites"

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const TILE_URL_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
const TILE_URL_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

const COUNTRIES_GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
const CAMEROON_ISO3 = "CMR"

// Vue élargie pour donner du contexte régional (pas juste le pays collé aux bords)
const REGION_BOUNDS: L.LatLngBoundsExpression = [
  [-2, 4],
  [16, 20],
]
const CAMEROON_CENTER: [number, number] = [5.9, 12.7]

const ASSET_DETAIL_BASE = "/fr/scans/inventory/asset"

// Voile léger sur le reste du monde, éclaircissement doux du Cameroun,
// contour fin plutôt que marqué.
const DIM_COLOR_LIGHT = "rgba(24, 24, 27, 0.30)"
const DIM_COLOR_DARK = "rgba(0, 0, 0, 0.50)"
const HIGHLIGHT_COLOR_LIGHT = "rgba(255, 255, 255, 0.06)"
const HIGHLIGHT_COLOR_DARK = "rgba(161, 161, 170, 0.10)" // zinc-400 très diffus, teinte grise plutôt que blanche crue
const OUTLINE_COLOR_LIGHT = "#52525b" // zinc-600, contour discret
const OUTLINE_COLOR_DARK = "#71717a" // zinc-500, gris qui se détache sans agresser

// ---------------------------------------------------------------------------
// Icônes par type d'actif
// ---------------------------------------------------------------------------

const ASSET_TYPE_ICONS: Record<string, string> = {
  database: `<path d="M12 8c4.418 0 8-1.343 8-3s-3.582-3-8-3-8 1.343-8 3 3.582 3 8 3Z"/><path d="M20 5v6c0 1.657-3.582 3-8 3s-8-1.343-8-3V5"/><path d="M20 11v6c0 1.657-3.582 3-8 3s-8-1.343-8-3v-6"/>`,
  web: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>`,
  "remote-access": `<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 20h8M12 17v3"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 6.5 9 6.5 9-6.5"/>`,
  network: `<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M5 8v2a4 4 0 0 0 4 4h1M19 8v2a4 4 0 0 1-4 4h-1"/>`,
  authentification: `<path d="M12 3 4 6.5v5c0 4.6 3.2 8.9 8 10 4.8-1.1 8-5.4 8-10v-5L12 3Z"/><path d="M9.5 12.5l1.8 1.8 3.2-3.6"/>`,
  unknown: `<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.2 2-2.4 3.5M12 17h.01"/>`,
}

function assetTypeIconSvg(type: string | undefined): string {
  const inner = ASSET_TYPE_ICONS[type ?? "unknown"] ?? ASSET_TYPE_ICONS.unknown
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
}

const assetTypeLabel: Record<string, string> = {
  database: "Base de données",
  web: "Web",
  "remote-access": "Accès distant",
  mail: "Messagerie",
  network: "Réseau",
  authentification: "Authentification",
  unknown: "Inconnu",
}

const severityLabel: Record<string, string> = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
  informational: "Informationnel",
}

// ---------------------------------------------------------------------------
// Données de démonstration
// ---------------------------------------------------------------------------

const MOCK_OVERVIEW_POINTS: MapPoint[] = [
  {
    id: "demo-asset-1",
    label: "srv-web-prod.minfi.gov.cm",
    sublabel: "Yaoundé, Cameroun (Démo)",
    coords: [3.8480, 11.5021],
    kind: "asset",
    assetType: "web",
    severity: "critical",
  },
  {
    id: "demo-asset-2",
    label: "mail.minfi.gov.cm",
    sublabel: "Douala, Cameroun (Démo)",
    coords: [4.0511, 9.7085],
    kind: "asset",
    assetType: "mail",
    severity: "high",
  },
  {
    id: "demo-asset-3",
    label: "gateway.garoua.minfi.gov.cm",
    sublabel: "Garoua, Cameroun (Démo)",
    coords: [9.3000, 13.4000],
    kind: "asset",
    assetType: "remote-access",
    severity: "medium",
  },
]

const MOCK_ORGANIZATIONAL_POINTS: MapPoint[] = [
  {
    id: "demo-site-1",
    label: "Hôtel des Finances (Services Centraux)",
    sublabel: "Yaoundé (Démo)",
    coords: [3.8480, 11.5021],
    kind: "site",
    assetCount: 14,
  },
  {
    id: "demo-site-2",
    label: "Direction Régionale du Littoral",
    sublabel: "Douala (Démo)",
    coords: [4.0511, 9.7085],
    kind: "site",
    assetCount: 8,
  },
  {
    id: "demo-site-3",
    label: "Secteur des Douanes du Nord",
    sublabel: "Garoua (Démo)",
    coords: [9.3000, 13.4000],
    kind: "site",
    assetCount: 3,
  },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MarkerKind = "asset" | "site"

interface MapPoint {
  id: string
  label: string
  sublabel?: string
  coords: [number, number]
  kind: MarkerKind
  assetType?: string
  severity?: Asset["severity"]
  assetCount?: number
}

type TooltipState = { point: MapPoint; x: number; y: number } | null

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

function PointTooltip({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip) return null
  const { point, x, y } = tooltip

  return (
    <div
      className="pointer-events-none absolute z-[1000] w-56 rounded-xl border border-border bg-popover shadow-xl p-3 space-y-2"
      style={{ left: x + 14, top: y - 10 }}
    >
      <p className="text-xs font-semibold truncate">{point.label}</p>

      {point.sublabel && (
        <p className="text-[11px] text-muted-foreground">{point.sublabel}</p>
      )}

      {point.kind === "asset" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">{assetTypeLabel[point.assetType ?? "unknown"]}</span>
          </div>
          {point.severity && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Sévérité</span>
              <span className="font-medium">{severityLabel[point.severity]}</span>
            </div>
          )}
        </div>
      )}

      {point.kind === "site" && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Actifs rattachés</span>
          <span className="font-semibold">{point.assetCount}</span>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/70 pt-0.5">Cliquer pour ouvrir le détail</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Utilitaire : polygone "monde moins Cameroun"
// ---------------------------------------------------------------------------

function buildInverseMask(countryGeometry: GeoJSON.Geometry): GeoJSON.Feature {
  const worldRing: [number, number][] = [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90],
  ]

  const holes: [number, number][][] =
    countryGeometry.type === "Polygon"
      ? [countryGeometry.coordinates[0] as [number, number][]]
      : countryGeometry.type === "MultiPolygon"
        ? countryGeometry.coordinates.map((poly) => poly[0] as [number, number][])
        : []

  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [worldRing, ...holes] },
  }
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

interface GeoMapCardProps {
  className?: string
}

const GeoMapCard = ({ className }: GeoMapCardProps) => {
  const router = useRouter()
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const dimLayerRef = useRef<L.GeoJSON | null>(null)
  const highlightLayerRef = useRef<L.GeoJSON | null>(null)
  const outlineLayerRef = useRef<L.GeoJSON | null>(null)
  const cameroonGeoRef = useRef<GeoJSON.Feature | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "organizational">("overview")
  const [tilesFailed, setTilesFailed] = useState(false)

  const { data: assets } = useInventoryAssets()
  const { data: orgData } = useOrganizationSites()

  const assetsArray = Array.isArray(assets) ? assets : []

  const targetOrgName =
    assetsArray
      .map((a: any) => {
        const scanOrg = a.scan?.targetOrganization || a.scan?.organization
        if (scanOrg) return typeof scanOrg === "object" ? scanOrg.name : scanOrg
        const scanName = a.scan?.name || a.scanName
        if (scanName) return scanName
        if (a.targetOrganization) {
          return typeof a.targetOrganization === "object" ? a.targetOrganization.name : a.targetOrganization
        }
        return null
      })
      .find((name) => !!name) || ""

  const cardTitle =
    activeTab === "organizational"
      ? `Carte des actifs — ${targetOrgName.toUpperCase()}`
      : "Carte des actifs — Cameroun"

  const realOverviewPoints: MapPoint[] = assetsArray
    .filter((a) => a.exposure === "externe" && a.geo?.lat != null && a.geo?.lon != null)
    .map((a) => ({
      id: a._id,
      label: a.hostname || a.ipAddress,
      sublabel: [a.geo.city, a.geo.country].filter(Boolean).join(", "),
      coords: [a.geo.lat as number, a.geo.lon as number],
      kind: "asset" as const,
      assetType: a.type,
      severity: a.severity,
    }))

  const realOrganizationalPoints: MapPoint[] = (orgData?.sites ?? []).map((site) => ({
    id: site.id,
    label: site.name,
    sublabel: site.city ?? undefined,
    coords: [site.lat as number, site.lon as number],
    kind: "site" as const,
    assetCount: site.assetCount,
  }))

  const hasRealData =
    activeTab === "overview" ? realOverviewPoints.length > 0 : realOrganizationalPoints.length > 0

  const points =
    activeTab === "overview"
      ? hasRealData
        ? realOverviewPoints
        : MOCK_OVERVIEW_POINTS
      : hasRealData
        ? realOrganizationalPoints
        : MOCK_ORGANIZATIONAL_POINTS

  // ---------------------------------------------------------------------
  // Initialisation : carte, tuiles, contexte régional, mise en valeur du Cameroun
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return

    const getIsDark = () => document.documentElement.classList.contains("dark")

    const map = L.map(mapDivRef.current, {
      center: CAMEROON_CENTER,
      zoom: 6,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: true,
      attributionControl: true,
      maxBounds: REGION_BOUNDS,
      maxBoundsViscosity: 0.8,
    })
    map.fitBounds(REGION_BOUNDS)
    map.getContainer().style.background = "transparent"
    mapRef.current = map

    const applyTiles = (isDark: boolean) => {
      if (tileLayerRef.current) map.removeLayer(tileLayerRef.current)
      const tiles = L.tileLayer(isDark ? TILE_URL_DARK : TILE_URL_LIGHT, {
        attribution: TILE_ATTRIBUTION,
        subdomains: "abcd",
        maxZoom: 19,
      })
      tiles.on("tileerror", () => setTilesFailed(true))
      tiles.on("tileload", () => setTilesFailed(false))
      tiles.addTo(map)
      tiles.bringToBack()
      tileLayerRef.current = tiles
    }

    const applyHighlight = (isDark: boolean) => {
      if (!cameroonGeoRef.current) return
      const geom = cameroonGeoRef.current

      if (dimLayerRef.current) map.removeLayer(dimLayerRef.current)
      if (highlightLayerRef.current) map.removeLayer(highlightLayerRef.current)
      if (outlineLayerRef.current) map.removeLayer(outlineLayerRef.current)

      // 1) Voile léger sur le reste du monde — le contexte régional reste lisible
      const dimMask = buildInverseMask(geom.geometry)
      dimLayerRef.current = L.geoJSON(dimMask, {
        style: {
          fillColor: isDark ? DIM_COLOR_DARK : DIM_COLOR_LIGHT,
          fillOpacity: 1,
          stroke: false,
        },
      }).addTo(map)

      // 2) Léger éclaircissement au-dessus du Cameroun (effet "spotlight")
      highlightLayerRef.current = L.geoJSON(geom, {
        style: {
          fillColor: isDark ? HIGHLIGHT_COLOR_DARK : HIGHLIGHT_COLOR_LIGHT,
          fillOpacity: 1,
          stroke: false,
        },
      }).addTo(map)

      // 3) Contour net et marqué du Cameroun — c'est lui qui doit accrocher l'œil
      // 3) Contour fin du Cameroun — discret, juste suffisant pour délimiter
outlineLayerRef.current = L.geoJSON(geom, {
  style: {
    fill: false,
    color: isDark ? OUTLINE_COLOR_DARK : OUTLINE_COLOR_LIGHT,
    weight: 1.2,
    opacity: 0.55,
  },
}).addTo(map)
    }

    applyTiles(getIsDark())
    markersLayerRef.current = L.layerGroup().addTo(map)

    fetch(COUNTRIES_GEOJSON_URL)
      .then((r) => r.json())
      .then((geojson: GeoJSON.FeatureCollection) => {
        const cameroon = geojson.features.find(
          (f) => (f.properties as any)?.["ISO3166-1-Alpha-3"] === CAMEROON_ISO3
        )
        if (!cameroon) return
        cameroonGeoRef.current = cameroon
        applyHighlight(getIsDark())
      })
      .catch(() => {})

    const resizeObserver = new ResizeObserver(() => map.invalidateSize())
    resizeObserver.observe(mapDivRef.current)
    const t = setTimeout(() => map.invalidateSize(), 250)

    const themeObserver = new MutationObserver(() => {
      const nowDark = getIsDark()
      applyTiles(nowDark)
      applyHighlight(nowDark)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      resizeObserver.disconnect()
      themeObserver.disconnect()
      clearTimeout(t)
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
      dimLayerRef.current = null
      highlightLayerRef.current = null
      outlineLayerRef.current = null
    }
  }, [])

  // ---------------------------------------------------------------------
  // Marqueurs
  // ---------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()

    points.forEach((point) => {
      const iconSvg =
        point.kind === "asset" ? assetTypeIconSvg(point.assetType) : assetTypeIconSvg("network")

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 30px; height: 30px; border-radius: 9999px;
            background: var(--card, #fff);
            border: 1.5px solid var(--border, #ccc);
            display: flex; align-items: center; justify-content: center;
            color: var(--foreground, #333);
            box-shadow: 0 1px 3px rgba(0,0,0,0.25);
            cursor: pointer;
          ">
            <div style="width: 16px; height: 16px;">${iconSvg}</div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const marker = L.marker(point.coords, { icon })

      marker.on("mouseover", (e) => {
        const containerPoint = map.latLngToContainerPoint((e as L.LeafletMouseEvent).latlng)
        setTooltip({ point, x: containerPoint.x, y: containerPoint.y })
      })
      marker.on("mouseout", () => setTooltip(null))
      marker.on("click", () => {
        if (point.kind === "asset") {
          router.push(`${ASSET_DETAIL_BASE}/${point.id}`)
        }
      })

      marker.addTo(layer)
    })
  }, [points, router])

  // ---------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------
  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h5 className="text-foreground transition-all duration-200">{cardTitle}</h5>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="organizational">Organisationnelle</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        <div ref={mapDivRef} className="w-full" style={{ minHeight: 420, background: "transparent" }} />

        {tilesFailed && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center bg-background/90 pointer-events-none">
            <p className="text-xs text-muted-foreground px-4 text-center">
              Le fond de carte n'a pas pu se charger (connexion réseau bloquée dans cet environnement).
            </p>
          </div>
        )}

        {!hasRealData && (
          <div className="absolute top-4 left-4 z-[500] p-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm shadow-md flex gap-2 items-center text-yellow-600 dark:text-yellow-400">
            <Eye className="h-4 w-4 shrink-0" />
            <span className="text-[10px] font-semibold">Mode Démonstration</span>
          </div>
        )}

        {!hasRealData && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs z-[500] p-3 rounded-xl border border-border/80 bg-background/90 backdrop-blur-sm shadow-md flex gap-2.5 items-start">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-foreground">
                Données simulées sur le Cameroun
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {activeTab === "overview"
                  ? "Aucun actif réel n'a été géolocalisé. Affichage des points simulés."
                  : "Aucun site réel n'est configuré. Affichage de la structure simulée."}
              </p>
            </div>
          </div>
        )}

        <PointTooltip tooltip={tooltip} />
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground select-none">
          {activeTab === "overview"
            ? `${points.length} actif(s) géolocalisé(s) · Molette pour zoomer`
            : `${points.length} site(s) · Molette pour zoomer`}
        </p>
      </CardFooter>
    </Card>
  )
}

export default GeoMapCard