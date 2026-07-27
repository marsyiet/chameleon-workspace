"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, Building2, MapPin } from "lucide-react"
import { MapPoint } from "./types"
import { assetTypeIconSvg, assetTypeLabel, severityLabel, ASSET_DETAIL_BASE } from "./constants"

interface AssetDetailPanelProps {
  point: MapPoint | null
  onClose: () => void
}

// Page listant les actifs rattachés à un site — à adapter au chemin réel de
// ton routing (probablement une vue filtrée de l'inventaire par site/org).
const SITE_ASSETS_BASE = "/fr/scans/inventory"

export default function AssetDetailPanel({ point, onClose }: AssetDetailPanelProps) {
  const router = useRouter()

  if (!point) return null

  return (
    <div className="absolute top-4 right-4 z-[600] w-64 rounded-xl border border-border bg-popover shadow-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {point.kind === "site" ? (
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <p className="text-sm font-semibold truncate">{point.label}</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {point.sublabel && (
        <p className="text-xs text-muted-foreground">{point.sublabel}</p>
      )}

      {point.kind === "asset" && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium flex items-center gap-1.5">
              <span
                className="w-4 h-4"
                dangerouslySetInnerHTML={{ __html: assetTypeIconSvg(point.assetType) }}
              />
              {assetTypeLabel[point.assetType ?? "unknown"]}
            </span>
          </div>
          {point.severity && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sévérité</span>
              <span className="font-medium">{severityLabel[point.severity]}</span>
            </div>
          )}
        </div>
      )}

      {point.kind === "site" && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Actifs rattachés</span>
          <span className="font-semibold">{point.assetCount}</span>
        </div>
      )}

      {point.kind === "asset" && (
        <Button
          size="sm"
          className="w-full"
          onClick={() => router.push(`${ASSET_DETAIL_BASE}/${point.id}`)}
        >
          Voir le détail
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      )}

      {point.kind === "site" && (
        <Button
          size="sm"
          className="w-full"
          disabled={!point.assetCount}
          onClick={() => router.push(`${SITE_ASSETS_BASE}?siteId=${point.id}`)}
        >
          Voir les {point.assetCount} actif{point.assetCount && point.assetCount > 1 ? "s" : ""}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}