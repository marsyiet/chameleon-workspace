"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export type GeoAsset = {
  id: string
  name: string          // ex: "api.example.com"
  type: string          // ex: "Sous-domaine", "Serveur web", "API"
  coords: [number, number]  // [longitude, latitude]
  city?: string
  country?: string
  cves?: number         // nombre de CVEs
  criticality?: "critical" | "high" | "medium" | "low" | "none"
}

const criticalityColor: Record<string, string> = {
  critical: "oklch(0.55 0.22 25)",
  high:     "oklch(0.62 0.21 25)",
  medium:   "oklch(0.75 0.18 60)",
  low:      "oklch(0.60 0.20 145)",
  none:     "oklch(0.65 0.01 255)",
}

const criticalityLabel: Record<string, string> = {
  critical: "Critique",
  high:     "Élevé",
  medium:   "Moyen",
  low:      "Faible",
  none:     "Aucune",
}

// ─── Données fictives ─────────────────────────────────────────────────────────

const FAKE_ASSETS: GeoAsset[] = [
  { id: "1", name: "api.example.com",      type: "API REST",       coords: [-74.006,   40.7128],  city: "New York",    country: "États-Unis",  cves: 3,  criticality: "high"     },
  { id: "2", name: "mail.example.com",     type: "Serveur mail",   coords: [-0.1276,   51.5074],  city: "Londres",     country: "Royaume-Uni", cves: 0,  criticality: "low"      },
  { id: "3", name: "cdn.example.com",      type: "CDN",            coords: [4.9041,    52.3676],  city: "Amsterdam",   country: "Pays-Bas",    cves: 1,  criticality: "medium"   },
  { id: "4", name: "dev.example.com",      type: "Sous-domaine",   coords: [3.3792,    6.5244],   city: "Lagos",       country: "Nigeria",     cves: 7,  criticality: "critical" },
  { id: "5", name: "storage.example.com",  type: "Bucket S3",      coords: [72.8777,   19.0760],  city: "Mumbai",      country: "Inde",        cves: 2,  criticality: "high"     },
  { id: "6", name: "auth.example.com",     type: "Service auth",   coords: [103.8198,  1.3521],   city: "Singapour",   country: "Singapour",   cves: 0,  criticality: "none"     },
  { id: "7", name: "old.example.com",      type: "Serveur web",    coords: [139.6917,  35.6895],  city: "Tokyo",       country: "Japon",       cves: 12, criticality: "critical" },
]

// ─── Tooltip ──────────────────────────────────────────────────────────────────

type TooltipState = { asset: GeoAsset; x: number; y: number } | null

function AssetTooltip({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip) return null
  const { asset, x, y } = tooltip
  const c = asset.criticality ?? "none"
  return (
    <div
      className="pointer-events-none absolute z-20 w-52 rounded-xl border border-border bg-popover shadow-xl p-3 space-y-2"
      style={{ left: x + 14, top: y - 10 }}
    >
      <div className="space-y-0.5">
        <p className="text-xs font-semibold truncate">{asset.name}</p>
        <p className="text-[11px] text-muted-foreground">{asset.type}</p>
      </div>

      {(asset.city || asset.country) && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {[asset.city, asset.country].filter(Boolean).join(", ")}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Criticité</span>
        <span
          className="font-medium px-1.5 py-0.5 rounded-full text-white"
          style={{ background: criticalityColor[c], fontSize: 10 }}
        >
          {criticalityLabel[c]}
        </span>
      </div>

      {asset.cves !== undefined && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">CVEs détectées</span>
          <span
            className="font-semibold"
            style={{ color: asset.cves > 0 ? criticalityColor["high"] : "var(--muted-foreground)" }}
          >
            {asset.cves}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface GeoMapCardProps {
  className?: string
  assets?: GeoAsset[]
}

const GeoMapCard = ({ className, assets = FAKE_ASSETS }: GeoMapCardProps) => {
  const svgRef  = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const hasData = assets.length > 0

  useEffect(() => {
    if (!hasData) return
    const wrap = wrapRef.current
    const svg  = svgRef.current
    if (!wrap || !svg) return

    const W = wrap.clientWidth
    const H = Math.round(W * 0.52)

    const projection = d3
      .geoNaturalEarth1()
      .scale(W / 6.2)
      .translate([W / 2, H / 2])

    const path   = d3.geoPath().projection(projection)
    const root   = d3.select(svg).attr("viewBox", `0 0 ${W} ${H}`)
    const style  = getComputedStyle(wrap)
    const fillDef = style.getPropertyValue("--secondary").trim()
    const fillHov = style.getPropertyValue("--muted-foreground").trim()
    const stroke  = style.getPropertyValue("--border").trim()
    const bg      = style.getPropertyValue("--background").trim()

    fetch(GEO_URL)
      .then((r) => r.json())
      .then((world: any) => {
        const countries = topojson.feature(world, world.objects.countries)

        root.selectAll(".country").remove()
        root
          .selectAll<SVGPathElement, unknown>(".country")
          .data((countries as any).features)
          .join("path")
          .attr("class", "country")
          .attr("d", path as any)
          .attr("fill", `oklch(${fillDef})`)
          .attr("stroke", `oklch(${stroke})`)
          .attr("stroke-width", 0.4)
          .style("transition", "fill 0.15s")
          .on("mouseenter", function () {
            d3.select(this).attr("fill", `oklch(${fillHov})`)
          })
          .on("mouseleave", function () {
            d3.select(this).attr("fill", `oklch(${fillDef})`)
          })

        // Marqueurs assets
        root.selectAll(".marker-group").remove()
        assets.forEach((asset) => {
          const [x, y] = projection(asset.coords) ?? [0, 0]
          const c = asset.criticality ?? "none"
          const col = criticalityColor[c]
          const g = root.append("g").attr("class", "marker-group")

          g.append("circle")
            .attr("cx", x).attr("cy", y).attr("r", 6)
            .attr("fill", col).attr("opacity", 0.2)
            .append("animate")
            .attr("attributeName", "r")
            .attr("values", "5;9;5")
            .attr("dur", "2.5s")
            .attr("repeatCount", "indefinite")

          g.append("circle")
            .attr("cx", x).attr("cy", y).attr("r", 4)
            .attr("fill", col)
            .attr("stroke", `oklch(${bg})`)
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .on("mouseenter", (e: MouseEvent) => {
              const rect = svg.getBoundingClientRect()
              setTooltip({ asset, x: e.clientX - rect.left, y: e.clientY - rect.top })
            })
            .on("mouseleave", () => setTooltip(null))
        })

        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 8])
          .translateExtent([[0, 0], [W, H]])
          .on("zoom", (e) => {
            root.selectAll<SVGElement, unknown>(".country, .marker-group")
              .attr("transform", e.transform.toString())
          })

        d3.select(svg).call(zoom)
      })
  }, [assets, hasData])

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <h5 className="valenzka text-foreground">Carte des assets</h5>
      </CardHeader>

      <CardContent className="p-0 relative" ref={wrapRef}>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
            <MapPin className="h-8 w-8 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">
              Pas de données géographiques
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Aucun asset de ce scan ne dispose d'informations de géolocalisation.
            </p>
          </div>
        ) : (
          <>
            <svg ref={svgRef} className="w-full" style={{ display: "block", minHeight: 200 }} />

            <AssetTooltip tooltip={tooltip} />

            
          </>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground select-none">
              Scroll pour zoomer · Drag pour déplacer
            </p>
      </CardFooter>
    </Card>
  )
}

export default GeoMapCard