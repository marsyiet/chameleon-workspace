"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle, MapPin, ChevronDown, Server as ServerIcon,
  Globe2, Clock,
} from "lucide-react"
import { Asset } from "@/types/asset"
import { cn } from "@/lib/utils"
import { formatNatureTag, NATURE_ICON, NATURE_LABEL } from "../../_constants/nature-types"

const SEVERITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400", label: "Critique" },
  high: { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", label: "Élevé" },
  medium: { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", label: "Moyen" },
  low: { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", label: "Faible" },
  informational: { bg: "bg-muted", text: "text-muted-foreground", label: "Info" },
}

// Orange chaud, complémentaire au violet signature — seul accent utilisé
// pour le tag de nature principal, cohérent avec le radius global de l'app.
const NATURE_TAG_STYLE = "bg-[oklch(0.70_0.17_45_/_0.16)] text-[oklch(0.42_0.15_45)] dark:bg-[oklch(0.70_0.17_45_/_0.22)] dark:text-[oklch(0.82_0.15_45)]"
const SECONDARY_TAG_STYLE = "bg-[oklch(0.58_0.26_290_/_0.10)] text-[oklch(0.42_0.20_290)] dark:bg-[oklch(0.58_0.26_290_/_0.18)] dark:text-[oklch(0.78_0.18_290)]"

interface AssetCardProps {
  asset: Asset
  className?: string
}

export function AssetCard({ asset, className }: AssetCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  const hasHostname = !!asset.hostname
  const primary = hasHostname ? asset.hostname : asset.ipAddress
  const secondary = hasHostname ? asset.ipAddress : null

  const services = asset.services ?? []
  const allCves = services.flatMap((s) => s.cves ?? [])
  const cveCount = allCves.length
  const highCveCount = allCves.filter((c) => (c.cvss ?? 0) >= 7).length

  const natureType = asset.natureType ?? "unknown"
  const NatureIcon = NATURE_ICON[natureType] ?? ServerIcon
  const natureLabel = NATURE_LABEL[natureType] ?? NATURE_LABEL.unknown
  const secondaryTags = (asset.natureTags ?? []).filter(
    (t) => t !== natureType.replace(/_/g, "-")
  )
  const severity = SEVERITY_STYLE[asset.severity] ?? SEVERITY_STYLE.informational

  const goToDetail = () => router.push(`/scans/${asset.scanId}/asset/${asset._id}`)

  return (
    <div
      className={cn(
        "rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Header contrasté */}
      <div
        onClick={goToDetail}
        className="bg-muted/70 px-5 py-4 space-y-3 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xl font-bold font-mono text-foreground truncate leading-tight">
              {primary}
            </p>
            {secondary && (
              <p className="text-sm font-mono text-muted-foreground truncate mt-0.5">
                {secondary}
              </p>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums",
              severity.bg, severity.text
            )}
          >
            {asset.riskScore?.value?.toFixed(1) ?? "0.0"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold",
              NATURE_TAG_STYLE
            )}
          >
            <NatureIcon className="h-4 w-4" />
            {natureLabel}
          </span>
          {secondaryTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium",
                SECONDARY_TAG_STYLE
              )}
            >
              {formatNatureTag(tag)}
            </span>
          ))}
        </div>
      </div>

      {/* Corps : stats clés, couleur qui porte du sens */}
      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Sévérité</p>
            <p className={cn("text-sm font-semibold", severity.text)}>
              {severity.label}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Services</p>
            <p className="text-sm font-semibold text-foreground">
              {services.length}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">CVE</p>
            <p className={cn(
              "text-sm font-semibold",
              cveCount > 0 ? "text-destructive" : "text-foreground"
            )}>
              {cveCount > 0 ? `${cveCount} (${highCveCount} critique)` : "Aucune"}
            </p>
          </div>
        </div>

        {asset.geo?.city && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[oklch(0.60_0.14_180)]" />
            {[asset.geo.city, asset.geo.country].filter(Boolean).join(", ")}
          </div>
        )}

        {/* Accordéon détails */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pt-2 border-t border-border"
        >
          Voir plus
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
          />
        </button>

        {expanded && (
          <div className="space-y-3 pt-1">
            {services.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Ports ouverts</p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((svc) => (
                    <span
                      key={`${svc.port}-${svc.protocol}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs font-mono text-secondary-foreground"
                    >
                      <Globe2 className="h-3 w-3" />
                      {svc.port}/{svc.protocol}
                      {svc.product && <span className="text-muted-foreground">· {svc.product}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(asset.subdomainsDiscovered?.length ?? 0) > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {asset.subdomainsDiscovered!.length} sous-domaine(s) découvert(s)
                </p>
              </div>
            )}

            {asset.os && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Système</p>
                <p className="text-sm text-foreground">{asset.os}</p>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Dernière détection : {new Date(asset.lastSeenAt).toLocaleDateString("fr-FR")}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToDetail()
              }}
              className="w-full text-center text-sm font-semibold text-[oklch(0.58_0.26_290)] hover:underline pt-1"
            >
              Voir le détail complet →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}