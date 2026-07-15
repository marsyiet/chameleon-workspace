"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { MapPin, Building2, Info, Eye } from "lucide-react"

import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { Asset } from "@/types/asset"
import { useOrganizationSites } from "@/hooks/use-organization-sites"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
// Code ISO 3166-1 numérique du Cameroun
const CAMEROON_ISO_ID = "120"

const severityColor: Record<string, string> = {
  critical: "oklch(0.55 0.22 25)",
  high: "oklch(0.62 0.21 25)",
  medium: "oklch(0.75 0.18 60)",
  low: "oklch(0.60 0.20 145)",
  informational: "oklch(0.65 0.01 255)",
}

const severityLabel: Record<string, string> = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
  informational: "Informationnel",
}

// Points de démonstration au Cameroun si aucune donnée n'est renvoyée
const MOCK_OVERVIEW_POINTS: MapPoint[] = [
  {
    id: "demo-asset-1",
    label: "srv-web-prod.minfi.gov.cm",
    sublabel: "Yaoundé, Cameroun (Démo)",
    coords: [11.5021, 3.8480], // Yaoundé
    kind: "asset",
    severity: "critical",
  },
  {
    id: "demo-asset-2",
    label: "mail.minfi.gov.cm",
    sublabel: "Douala, Cameroun (Démo)",
    coords: [9.7085, 4.0511], // Douala
    kind: "asset",
    severity: "high",
  },
  {
    id: "demo-asset-3",
    label: "gateway.garoua.minfi.gov.cm",
    sublabel: "Garoua, Cameroun (Démo)",
    coords: [13.4000, 9.3000], // Garoua
    kind: "asset",
    severity: "medium",
  }
]

const MOCK_ORGANIZATIONAL_POINTS: MapPoint[] = [
  {
    id: "demo-site-1",
    label: "Hôtel des Finances (Services Centraux)",
    sublabel: "Yaoundé (Démo)",
    coords: [11.5021, 3.8480],
    kind: "site",
    assetCount: 14,
  },
  {
    id: "demo-site-2",
    label: "Direction Régionale du Littoral",
    sublabel: "Douala (Démo)",
    coords: [9.7085, 4.0511],
    kind: "site",
    assetCount: 8,
  },
  {
    id: "demo-site-3",
    label: "Secteur des Douanes du Nord",
    sublabel: "Garoua (Démo)",
    coords: [13.4000, 9.3000],
    kind: "site",
    assetCount: 3,
  }
]

type MarkerKind = "asset" | "site"

interface MapPoint {
  id: string
  label: string
  sublabel?: string
  coords: [number, number] // [lon, lat]
  kind: MarkerKind
  severity?: Asset["severity"]
  assetCount?: number
}

type TooltipState = { point: MapPoint; x: number; y: number } | null

function PointTooltip({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip) return null
  const { point, x, y } = tooltip

  return (
    <div
      className="pointer-events-none absolute z-20 w-56 rounded-xl border border-border bg-popover shadow-xl p-3 space-y-2"
      style={{ left: x + 14, top: y - 10 }}
    >
      <div className="flex items-center gap-1.5">
        {point.kind === "site" ? (
          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <p className="text-xs font-semibold truncate">{point.label}</p>
      </div>

      {point.sublabel && (
        <p className="text-[11px] text-muted-foreground">{point.sublabel}</p>
      )}

      {point.kind === "asset" && point.severity && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Sévérité</span>
          <span
            className="font-medium px-1.5 py-0.5 rounded-full text-white"
            style={{ background: severityColor[point.severity], fontSize: 10 }}
          >
            {severityLabel[point.severity]}
          </span>
        </div>
      )}

      {point.kind === "site" && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Actifs rattachés</span>
          <span className="font-semibold">{point.assetCount}</span>
        </div>
      )}
    </div>
  )
}

interface GeoMapCardProps {
  className?: string
}

const GeoMapCard = ({ className }: GeoMapCardProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "organizational">("overview")

  const { data: assets } = useInventoryAssets()
  const { data: orgData } = useOrganizationSites()

  const assetsArray = Array.isArray(assets) ? assets : []

  // Extraction intelligente de l'organisation
  const targetOrgName = assetsArray
    .map((a: any) => {
      const scanOrg = a.scan?.targetOrganization || a.scan?.organization
      if (scanOrg) {
        return typeof scanOrg === "object" ? scanOrg.name : scanOrg
      }
      const scanName = a.scan?.name || a.scanName
      if (scanName) return scanName

      if (a.targetOrganization) {
        return typeof a.targetOrganization === "object" ? a.targetOrganization.name : a.targetOrganization
      }
      return null
    })
    .find((name) => !!name) || "MINFI" // Fallback par défaut sur MINFI pour la démo

  const cardTitle =
    activeTab === "organizational"
      ? `Carte des actifs — ${targetOrgName.toUpperCase()}`
      : "Carte des actifs — Cameroun"

  // Essai de chargement des vrais points d'actifs
  const realOverviewPoints: MapPoint[] = assetsArray
    .filter((a) => a.exposure === "externe" && a.geo?.lat != null && a.geo?.lon != null)
    .map((a) => ({
      id: a._id,
      label: a.hostname || a.ipAddress,
      sublabel: [a.geo.city, a.geo.country].filter(Boolean).join(", "),
      coords: [a.geo.lon as number, a.geo.lat as number],
      kind: "asset" as const,
      severity: a.severity,
    }))

  // Essai de chargement des vrais sites
  const realOrganizationalPoints: MapPoint[] = (orgData?.sites ?? []).map((site) => ({
    id: site.id,
    label: site.name,
    sublabel: site.city ?? undefined,
    coords: [site.lon as number, site.lat as number],
    kind: "site" as const,
    assetCount: site.assetCount,
  }))

  // Détermination si on utilise les données de démonstration ou réelles
  const hasRealData = activeTab === "overview" ? realOverviewPoints.length > 0 : realOrganizationalPoints.length > 0
  
  const points = activeTab === "overview" 
    ? (hasRealData ? realOverviewPoints : MOCK_OVERVIEW_POINTS)
    : (hasRealData ? realOrganizationalPoints : MOCK_ORGANIZATIONAL_POINTS)

  useEffect(() => {
    const wrap = wrapRef.current
    const svg = svgRef.current
    if (!wrap || !svg) return

    const W = wrap.clientWidth || 500
    const H = Math.round(W * 0.85)

    const root = d3.select(svg).attr("viewBox", `0 0 ${W} ${H}`)
    const style = getComputedStyle(wrap)
    const fillDef = style.getPropertyValue("--secondary").trim()
    const stroke = style.getPropertyValue("--border").trim()
    const bg = style.getPropertyValue("--background").trim()

    fetch(GEO_URL)
      .then((r) => r.json())
      .then((world: any) => {
        const allCountries = topojson.feature(world, world.objects.countries) as any
        const cameroon = allCountries.features.find(
          (f: any) => f.id === CAMEROON_ISO_ID
        )
        if (!cameroon) return

        const projection = d3.geoMercator().fitSize([W, H], cameroon)
        const path = d3.geoPath().projection(projection)

        root.selectAll(".country").remove()
        root
          .append("path")
          .attr("class", "country")
          .attr("d", path(cameroon) as any)
          .attr("fill", fillDef.startsWith("oklch") ? fillDef : `oklch(${fillDef})`)
          .attr("stroke", stroke.startsWith("oklch") ? stroke : `oklch(${stroke})`)
          .attr("stroke-width", 1)

        root.selectAll(".marker-group").remove()
        points.forEach((point) => {
          const projected = projection(point.coords)
          if (!projected) return
          const [x, y] = projected
          const color =
            point.kind === "asset"
              ? severityColor[point.severity ?? "informational"]
              : "oklch(0.55 0.20 260)"
          const radius = point.kind === "site" ? 6 + Math.min(point.assetCount ?? 0, 10) : 4

          const g = root.append("g").attr("class", "marker-group")

          g.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius)
            .attr("fill", color)
            .attr("opacity", 0.2)
            .append("animate")
            .attr("attributeName", "r")
            .attr("values", `${radius};${radius + 4};${radius}`)
            .attr("dur", "2.5s")
            .attr("repeatCount", "indefinite")

          g.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", point.kind === "site" ? radius * 0.6 : 4)
            .attr("fill", color)
            .attr("stroke", bg.startsWith("oklch") ? bg : `oklch(${bg})`)
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .on("mouseenter", (e: MouseEvent) => {
              const rect = svg.getBoundingClientRect()
              setTooltip({ point, x: e.clientX - rect.left, y: e.clientY - rect.top })
            })
            .on("mouseleave", () => setTooltip(null))
        })

        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 8])
          .on("zoom", (e) => {
            root
              .selectAll<SVGElement, unknown>(".country, .marker-group")
              .attr("transform", e.transform.toString())
          })

        d3.select(svg).call(zoom)
      })
  }, [points, activeTab])

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

      <CardContent className="p-0 relative" ref={wrapRef}>
        <svg ref={svgRef} className="w-full" style={{ display: "block", minHeight: 350 }} />
        
        {/* Badge d'information flottant si la carte utilise les données de démonstration */}
        {!hasRealData && (
          <div className="absolute top-4 left-4 p-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm shadow-md flex gap-2 items-center text-yellow-600 dark:text-yellow-400">
            <Eye className="h-4 w-4 shrink-0" />
            <span className="text-[10px] font-semibold">Mode Démonstration</span>
          </div>
        )}

        {!hasRealData && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs p-3 rounded-xl border border-border/80 bg-background/90 backdrop-blur-sm shadow-md flex gap-2.5 items-start">
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
            ? `${points.length} actif(s) géolocalisé(s) · Utilisez la molette pour zoomer`
            : `${points.length} site(s) · Utilisez la molette pour zoomer`}
        </p>
      </CardFooter>
    </Card>
  )
}

export default GeoMapCard