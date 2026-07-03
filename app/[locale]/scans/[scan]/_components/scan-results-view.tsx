"use client"

import { useState } from "react"
import { Download, RefreshCw, Clock, Globe, Shield, Server, Network, Database, Terminal, Cloud, Layers } from "lucide-react"
import { Asset, Scan } from "@/app/[locale]/scans/_constants/data-types"
import { AssetRow } from "./asset-row"
import { Button } from "@/components/ui/button"
import StatusBadge from "./status-bade"
import RiskScoreCard from "./risk-score-card"
import GeoMapCard from "./map-card"
import AssetsPreviewCard from "./preview-card"

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

// ─── Catégorisation ───────────────────────────────────────────────────────────

type CategoryKey = "naming" | "network" | "app" | "database" | "remote" | "cloud" | "other"

interface Category {
  key: CategoryKey
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}

const CATEGORIES: Category[] = [
  { key: "naming",   label: "Nommage",     description: "Domaines, sous-domaines, DNS",          icon: Globe,    color: "oklch(0.58 0.26 290)",    bg: "oklch(0.58 0.26 290 / 0.12)"  },
  { key: "network",  label: "Réseau",      description: "Adresses IP, ports, services exposés",  icon: Network,  color: "oklch(0.55 0.22 240)",    bg: "oklch(0.55 0.22 240 / 0.12)"  },
  { key: "app",      label: "Applicatif",  description: "Web, API, interfaces d'administration", icon: Layers,   color: "oklch(0.60 0.20 180)",    bg: "oklch(0.60 0.20 180 / 0.12)"  },
  { key: "database", label: "Bases de données", description: "MySQL, PostgreSQL, MongoDB...",    icon: Database, color: "oklch(0.65 0.18 60)",     bg: "oklch(0.65 0.18 60 / 0.12)"   },
  { key: "remote",   label: "Accès distants",   description: "SSH, RDP, VPN exposés",           icon: Terminal, color: "oklch(0.62 0.21 25)",     bg: "oklch(0.62 0.21 25 / 0.12)"   },
  { key: "cloud",    label: "Cloud",       description: "Instances, buckets, fonctions",         icon: Cloud,    color: "oklch(0.60 0.18 310)",    bg: "oklch(0.60 0.18 310 / 0.12)"  },
  { key: "other",    label: "Autres",      description: "Actifs non classifiés",                 icon: Server,   color: "var(--muted-foreground)", bg: "var(--muted)"                  },
]

function categorize(asset: Asset): CategoryKey {
  const tags  = asset.tags ?? []
  const ports = asset.openPorts?.map((p: any) => p.port ?? p) ?? []
  if (tags.some((t: string) => t.startsWith("database/"))) return "database"
  if (tags.some((t: string) => ["remote/ssh","remote/rdp","remote/vnc"].includes(t))) return "remote"
  if (tags.some((t: string) => t.startsWith("cloud/"))) return "cloud"
  if (tags.some((t: string) => t.startsWith("web/") || t.startsWith("api/"))) return "app"
  if (tags.some((t: string) => t.startsWith("dns/") || t.startsWith("domain/"))) return "naming"
  if (ports.some((p: number) => [80,443,8080,8443,3000].includes(p))) return "app"
  if (ports.some((p: number) => [22].includes(p))) return "remote"
  if (ports.some((p: number) => [3306,5432,27017,6379,9200].includes(p))) return "database"
  if (ports.length > 0) return "network"
  return "naming"
}

// ─── Vue principale ───────────────────────────────────────────────────────────

interface Props {
  scan: Scan
  assets: Asset[]
  onRestart?: () => void
}

export default function ScanResultsView({ scan, assets, onRestart }: Props) {
  const totalPorts   = assets.reduce((acc, a) => acc + (a.openPorts?.length ?? 0), 0)
  const allCves      = assets.flatMap((a) => a.cves ?? [])
  const highCves     = allCves.filter((c: any) => c.cvss !== null && c.cvss >= 7).length
  const duration     = formatDuration(scan.startedAt, scan.completedAt)
  const targetsLabel = scan.targets.map((t: any) => t.target).join(", ")

  const grouped = assets.reduce<Record<CategoryKey, Asset[]>>((acc, asset) => {
    const key = categorize(asset)
    acc[key] = [...(acc[key] ?? []), asset]
    return acc
  }, {} as Record<CategoryKey, Asset[]>)

  const filledCategories = CATEGORIES.filter((c) => (grouped[c.key] ?? []).length > 0)
  const [activeTab, setActiveTab] = useState<CategoryKey>(filledCategories[0]?.key ?? "naming")

  const metrics = [
    { label: "Assets",        value: assets.length, icon: Globe,  danger: false },
    { label: "Ports ouverts", value: totalPorts,    icon: Server, danger: false },
    { label: "CVEs ≥ 7.0",   value: highCves,       icon: Shield, danger: true  },
    { label: "Durée",         value: duration,       icon: Clock,  danger: false },
  ]

  const activeCategory = CATEGORIES.find((c) => c.key === activeTab)!
  const activeAssets   = grouped[activeTab] ?? []
  const activeCritical = activeAssets.filter((a) =>
    a.cves?.some((c: any) => c.cvss !== null && c.cvss >= 7)
  ).length

  return (
    <div className="w-full mx-auto space-y-6">

      {/* ── Header ── (inchangé) */}
      <div className="relative rounded-2xl overflow-hidden px-6 py-8 min-h-[180px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-primary)" }} />
        <div className="absolute right-8 -bottom-10 flex items-center select-none pointer-events-none">
          <img src="/images/demi.png" alt="" className="w-60" />
        </div>
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            <h2 className="valenzka text-white text-3xl leading-tight">{scan.name}</h2>
            <StatusBadge status={scan.status} />
            <p className="text-sm flex items-center gap-2 flex-wrap">
              <span>{targetsLabel}</span>
              <span className="text-muted-foreground">·</span>
              <span className="capitalize">{scan.scanType} scan</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-bold">Durée {duration}</span>
            </p>
            <Button>
              <Download className="h-3.5 w-3.5" />
              Télécharger le rapport
            </Button>
          </div>
        </div>
      </div>

      {/* ── Grille map + risk ── (inchangée) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AssetsPreviewCard className="md:col-span-1" />
        <RiskScoreCard className="md:col-span-1" />
        <GeoMapCard className="md:col-span-2" />
      </div>

      {/* ── Métriques ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon
          const isDanger = m.danger && Number(m.value) > 0
          return (
            <div key={m.label} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {m.label}
                </p>
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    background: isDanger
                      ? "oklch(0.62 0.21 25 / 0.15)"
                      : "color-mix(in oklch, var(--gradient-from) 15%, transparent)",
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: isDanger ? "oklch(0.62 0.21 25)" : "var(--gradient-from)" }}
                  />
                </div>
              </div>
              <p
                className="text-3xl font-bold"
                style={{ color: isDanger ? "oklch(0.62 0.21 25)" : "var(--foreground)" }}
              >
                {m.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Assets par catégorie ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">

        {/* Tabs catégories */}
        <div className="flex overflow-x-auto border-b border-border">
          {filledCategories.map((cat) => {
            const Icon = cat.icon
            const count = (grouped[cat.key] ?? []).length
            const isActive = activeTab === cat.key
            return (
              <button
                key={cat.key}
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
                {/* Indicateur actif */}
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

        {/* En-tête de la catégorie active */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
          <div>
            <p className="text-xs text-muted-foreground">{activeCategory.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {activeCritical > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                {activeCritical} CVE critique{activeCritical > 1 ? "s" : ""}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {activeAssets.length} asset{activeAssets.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Liste des assets — pas de border imbriquée */}
        <div className="divide-y divide-border">
          {activeAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-8 text-center">
              Aucun asset dans cette catégorie.
            </p>
          ) : (
            activeAssets.map((asset) => (
              <div key={asset._id} className="px-5 py-2">
                <AssetRow asset={asset} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Terminé le {formatDate(scan.completedAt)}
        </p>
        <div className="flex items-center gap-2">
          {onRestart && (
            <Button variant="outline" size="sm" onClick={onRestart}>
              <RefreshCw className="h-3.5 w-3.5" />
              Relancer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}