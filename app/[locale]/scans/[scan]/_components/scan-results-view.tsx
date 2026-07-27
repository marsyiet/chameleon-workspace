"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, RefreshCw, Globe, Server, Network, Database, Terminal, Cloud, KeyRound } from "lucide-react"
import { Scan } from "@/app/[locale]/scans/_constants/data-types"
import { Asset } from "@/types/asset"
import { AssetRow } from "./asset-row"
import { Button } from "@/components/ui/button"
import StatusBadge from "./status-bade"
import RiskScoreCard from "./risk-score-card"
import AssetsPreviewCard from "./preview-card"
import GeoMapCard from "../../_components/geo-map/geo-map-card"

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
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

interface Category {
  key: Asset["assetType"]
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}

const CATEGORIES: Category[] = [
  { key: "web", label: "Web", description: "Sites et applications web", icon: Globe, color: "oklch(0.60 0.20 180)", bg: "oklch(0.60 0.20 180 / 0.12)" },
  { key: "api", label: "API", description: "Interfaces API exposées", icon: Server, color: "oklch(0.58 0.26 290)", bg: "oklch(0.58 0.26 290 / 0.12)" },
  { key: "database", label: "Bases de données", description: "MySQL, PostgreSQL, MongoDB, Redis...", icon: Database, color: "oklch(0.65 0.18 60)", bg: "oklch(0.65 0.18 60 / 0.12)" },
  { key: "authentication", label: "Authentification", description: "VPN, SSO, portails de connexion", icon: KeyRound, color: "oklch(0.62 0.21 25)", bg: "oklch(0.62 0.21 25 / 0.12)" },
  { key: "remote-access", label: "Accès distants", description: "SSH, RDP, VNC exposés", icon: Terminal, color: "oklch(0.62 0.21 25)", bg: "oklch(0.62 0.21 25 / 0.12)" },
  { key: "mail", label: "Messagerie", description: "SMTP, IMAP, webmail", icon: Cloud, color: "oklch(0.60 0.18 310)", bg: "oklch(0.60 0.18 310 / 0.12)" },
  { key: "network", label: "Réseau", description: "Équipements réseau identifiés", icon: Network, color: "oklch(0.55 0.22 240)", bg: "oklch(0.55 0.22 240 / 0.12)" },
  { key: "unknown", label: "Non classifiés", description: "Actifs non identifiés", icon: Server, color: "var(--muted-foreground)", bg: "var(--muted)" },
]

interface Props {
  scan: Scan
  assets: Asset[]
  onRestart?: () => void
  onViewAllAssets?: () => void
}

export default function ScanResultsView({ scan, assets, onRestart, onViewAllAssets }: Props) {
  const router = useRouter()
  const duration = formatDuration(scan.startedAt, scan.completedAt)
  const targetsLabel = scan.targets.map((t: any) => t.target).join(", ")

  const grouped = assets.reduce<Record<string, Asset[]>>((acc, asset) => {
    const key = asset.assetType
    acc[key] = [...(acc[key] ?? []), asset]
    return acc
  }, {})

  const filledCategories = CATEGORIES.filter((c) => (grouped[c.key] ?? []).length > 0)
  const [activeTab, setActiveTab] = useState<Asset["assetType"]>(
    filledCategories[0]?.key ?? "web"
  )

  const activeCategory = CATEGORIES.find((c) => c.key === activeTab)!
  const activeAssets = grouped[activeTab] ?? []
  const activeCritical = activeAssets.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  ).length

  const totalCritical = assets.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  ).length

  return (
    <div className="w-full mx-auto space-y-6">

      {/* ── Header : informations en colonnes, sans gradient ni séparateurs ── */}
      <div className="rounded-2xl border border-border bg-card px-6 py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="space-y-2">
            <h3 className="text-foreground">{scan.name}</h3>
            <StatusBadge status={scan.status} />
          </div>

          <div className="flex items-center gap-2">
            {onRestart && (
              <Button variant="outline" size="sm" onClick={onRestart}>
                <RefreshCw className="h-3.5 w-3.5" />
                Relancer
              </Button>
            )}
            <Button size="sm">
              <Download className="h-3.5 w-3.5" />
              Télécharger le rapport
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-6 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cible</p>
            <p className="text-sm font-medium text-foreground truncate">{targetsLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Type de scan</p>
            <p className="text-sm font-medium text-foreground capitalize">{scan.scanType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Durée</p>
            <p className="text-sm font-medium text-foreground">{duration}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Actifs découverts</p>
            <p className="text-sm font-medium text-foreground">{assets.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Risque élevé</p>
            <p className="text-sm font-medium text-foreground">
              {totalCritical > 0 ? (
                <span className="text-destructive">{totalCritical} actif{totalCritical > 1 ? "s" : ""}</span>
              ) : (
                "Aucun"
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Terminé le</p>
            <p className="text-sm font-medium text-foreground">{formatDate(scan.completedAt)}</p>
          </div>
        </div>
      </div>

      {/* ── Grille map + risk + aperçu ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <RiskScoreCard className="md:col-span-1" assets={assets} scanTarget={targetsLabel} />
        <GeoMapCard className="md:col-span-2" assets={assets} />
      </div>

      {/* ── Assets par catégorie ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border">
          {filledCategories.map((cat) => {
            const Icon = cat.icon
            const count = (grouped[cat.key] ?? []).length
            const isActive = activeTab === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveTab(cat.key)}
                className="flex items-center gap-2 px-4 py-3.5 text-sm whitespace-nowrap transition-colors relative shrink-0"
                style={{
                  color: isActive ? cat.color : "var(--muted-foreground)",
                  background: isActive ? cat.bg : "transparent",
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{cat.label}</span>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? cat.color : "var(--secondary)",
                    color: isActive ? "white" : "var(--muted-foreground)",
                  }}
                >
                  {count}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: cat.color }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
          <p className="text-xs text-muted-foreground">{activeCategory.description}</p>
          <div className="flex items-center gap-2">
            {activeCritical > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                {activeCritical} à risque élevé
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {activeAssets.length} asset{activeAssets.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {activeAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-8 text-center">
              Aucun asset dans cette catégorie.
            </p>
          ) : (
            activeAssets.map((asset) => (
              <div key={asset._id} className="px-5 py-2">
                <AssetRow
                  asset={asset}
                  onClick={() => router.push(`/scans/${scan._id}/asset/${asset._id}`)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}