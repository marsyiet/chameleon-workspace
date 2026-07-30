"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, RefreshCw, Layers, ShieldAlert, CheckCircle2, AlertTriangle, Map, ChevronDown } from "lucide-react"
import { Scan } from "@/app/[locale]/scans/_constants/data-types"
import { Asset } from "@/types/asset"
import { Button } from "@/components/ui/button"
import { ProgressArc } from "@/components/custom/progress-arc"
import StatusBadge from "./status-bade"
import GeoMapCard from "../../_components/geo-map/geo-map-card"
import { AssetCard } from "../../inventory/_components/asset-card"
import { cn } from "@/lib/utils"

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—"
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface Props {
  scan: Scan
  assets: Asset[]
  onRestart?: () => void
  onViewAllAssets?: () => void
}

export default function ScanResultsView({ scan, assets, onRestart }: Props) {
  const router = useRouter()
  const [showMap, setShowMap] = useState(false)

  const duration = formatDuration(scan.startedAt, scan.completedAt)
  const targetsLabel = scan.targets?.map((t: any) => t.target).join(", ") || "Non spécifié"

  // ── Calcul du Risk Score ──────────────────────────────────────────────
  const scores = assets
    .map((a) => a.riskScore?.value ?? 0)
    .filter((v) => v > 0)

  const maxScore = scores.length > 0 ? Math.max(...scores) : 0
  const displayScore = Math.round(maxScore * 10)
  const worstAsset = assets.find((a) => (a.riskScore?.value ?? 0) === maxScore)

  const riskMessage =
    displayScore === 0
      ? "Aucun score de risque disponible."
      : displayScore >= 70
        ? `Risque élevé sur ${worstAsset?.hostname || worstAsset?.ipAddress || "un actif"}.`
        : displayScore >= 40
          ? `Risque modéré sur ${worstAsset?.hostname || worstAsset?.ipAddress || "un actif"}.`
          : "Aucun risque significatif détecté."

  const totalCritical = assets.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  ).length

  return (
    <div className="w-full mx-auto space-y-6">
      {/* ── Header Synthétique + Risk Score Compact ── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        {/* Séparateur pointillé */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-dashed border-border">
          
          {/* Métadonnées & Identité du Scan */}
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3 flex-wrap">
              <h2>{scan.name}</h2>
              <StatusBadge status={scan.status} />
            </div>
            
            <p className="text-xl text-muted-foreground flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">Cible :</span> 
              <span className="text-foreground">{targetsLabel}</span>
            </p>
          </div>

          {/* Inline Risk Score Widget + Actions */}
          <div className="flex items-center gap-6 sm:gap-8 bg-muted/40 p-4 px-6 rounded-xl border border-border/50 shrink-0">
            {/* Conteneur du ProgressArc */}
            <div className="flex items-center gap-4">
              <div className="w-40 relative flex items-center justify-center shrink-0">
                <ProgressArc
                  value={displayScore}
                  barWidth={12}
                  gap={2}
                  gradient={["oklch(0.58 0.26 290)", "oklch(0.68 0.23 10)"]}
                  showScore
                  scoreLabel=""
                  glow={false}
                  emptyOpacity={0.2}
                  barLength={0.12}
                  radius={0.45}
                />
              </div>

              <div className="space-y-1 max-w-[200px]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {displayScore >= 70 ? (
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                  ) : displayScore >= 40 ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  Risk Score
                </div>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-3">
                  {riskMessage}
                </p>
              </div>
            </div>

            {/* Actions : Relancer + Rapport côte à côte */}
            <div className="flex items-center gap-2 border-l border-border/80 pl-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRestart} 
                className="gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Relancer</span>
              </Button>

              <Button size="sm" className="gap-2">
                <Download className="h-3.5 w-3.5" />
                <span>Rapport</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Métriques d'exécution */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-0.5">Type de scan</p>
            <p className="text-lg font-semibold text-foreground capitalize">{scan.scanType}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Durée</p>
            <p className="text-lg font-semibold text-foreground">{duration}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Actifs découverts</p>
            <p className="text-lg font-semibold text-foreground">{assets.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Actifs à risque élevé</p>
            <p className="text-lg font-semibold text-foreground">
              {totalCritical > 0 ? (
                <span className="text-red-600 dark:text-red-400 font-bold">
                  {totalCritical}
                </span>
              ) : (
                "0"
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Terminé le</p>
            <p className="text-lg font-semibold text-foreground">{formatDate(scan.completedAt)}</p>
          </div>
        </div>
      </div>

      {/* ── Section Cartographie Géographique (Sans conteneur card) ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Cartographie géographique
            </h3>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMap((prev) => !prev)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <span>{showMap ? "Masquer la carte" : "Afficher la carte"}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showMap && "rotate-180")} />
          </Button>
        </div>

        {showMap && <GeoMapCard assets={assets} />}
      </div>

      {/* ── Section Actifs Découverts (Grille d'AssetCards) ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Actifs découverts
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
              {assets.length}
            </span>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun actif n'a été découvert lors de ce scan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assets.map((asset) => (
              <AssetCard key={asset._id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}