"use client"

import { useState } from "react"
import { Download, RefreshCw, Clock, Globe, Shield, Server, ChevronDown, Network, Database, Terminal, Cloud, Layers } from "lucide-react"
import { Asset, Scan } from "@/app/[locale]/scans/_constants/data-types"
import { AssetRow } from "./asset-row"
import { Button } from "@/components/ui/button"

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Scan["status"] }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    running:   "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
    pending:   "bg-secondary text-muted-foreground border-border",
    failed:    "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400",
  }
  const dots: Record<string, string> = {
    completed: "bg-emerald-500",
    running:   "bg-blue-500 animate-pulse",
    pending:   "bg-muted-foreground",
    failed:    "bg-red-500",
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${styles[status] ?? styles.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? dots.pending}`} />
      {status}
    </span>
  )
}

// ─── Catégorisation ──────────────────────────────────────────────────────────

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
  {
    key: "naming",
    label: "Actifs de nommage",
    description: "Domaines, sous-domaines, DNS",
    icon: Globe,
    color: "oklch(0.58 0.26 290)",
    bg: "oklch(0.58 0.26 290 / 0.12)",
  },
  {
    key: "network",
    label: "Actifs réseau",
    description: "Adresses IP, ports, services exposés",
    icon: Network,
    color: "oklch(0.55 0.22 240)",
    bg: "oklch(0.55 0.22 240 / 0.12)",
  },
  {
    key: "app",
    label: "Actifs applicatifs",
    description: "Web, API, interfaces d'administration",
    icon: Layers,
    color: "oklch(0.60 0.20 180)",
    bg: "oklch(0.60 0.20 180 / 0.12)",
  },
  {
    key: "database",
    label: "Bases de données",
    description: "MySQL, PostgreSQL, MongoDB...",
    icon: Database,
    color: "oklch(0.65 0.18 60)",
    bg: "oklch(0.65 0.18 60 / 0.12)",
  },
  {
    key: "remote",
    label: "Accès distants",
    description: "SSH, RDP, VPN exposés",
    icon: Terminal,
    color: "oklch(0.62 0.21 25)",
    bg: "oklch(0.62 0.21 25 / 0.12)",
  },
  {
    key: "cloud",
    label: "Actifs cloud",
    description: "Instances, buckets, fonctions",
    icon: Cloud,
    color: "oklch(0.60 0.18 310)",
    bg: "oklch(0.60 0.18 310 / 0.12)",
  },
  {
    key: "other",
    label: "Autres",
    description: "Actifs non classifiés",
    icon: Server,
    color: "var(--muted-foreground)",
    bg: "var(--muted)",
  },
]

function categorize(asset: Asset): CategoryKey {
  const tags = asset.tags ?? []
  const ports = asset.openPorts?.map((p: any) => p.port ?? p) ?? []

  if (tags.some((t: string) => t.startsWith("database/"))) return "database"
  if (tags.some((t: string) => ["remote/ssh", "remote/rdp", "remote/vnc"].includes(t))) return "remote"
  if (tags.some((t: string) => t.startsWith("cloud/"))) return "cloud"
  if (tags.some((t: string) => t.startsWith("web/") || t.startsWith("api/"))) return "app"
  if (tags.some((t: string) => t.startsWith("dns/") || t.startsWith("domain/"))) return "naming"
  if (ports.some((p: number) => [80, 443, 8080, 8443, 3000].includes(p))) return "app"
  if (ports.some((p: number) => [22].includes(p))) return "remote"
  if (ports.some((p: number) => [3306, 5432, 27017, 6379, 9200].includes(p))) return "database"
  if (ports.length > 0) return "network"
  return "naming"
}

// ─── Section catégorie ───────────────────────────────────────────────────────

function CategorySection({
  category,
  assets,
  defaultOpen = false,
}: {
  category: Category
  assets: Asset[]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = category.icon
  const criticalCount = assets.filter((a) =>
    a.cves?.some((c: any) => c.cvss !== null && c.cvss >= 7)
  ).length

  if (assets.length === 0) return null

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* En-tête de section */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors text-left"
      >
        {/* Icône */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: category.bg, color: category.color }}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{category.label}</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: category.bg, color: category.color }}
            >
              {assets.length}
            </span>
            {criticalCount > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                {criticalCount} CVE critique{criticalCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Liste des assets */}
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {assets.map((asset) => (
            <div key={asset._id} className="px-5 py-2">
              <AssetRow asset={asset} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Vue principale ──────────────────────────────────────────────────────────

interface Props {
  scan: Scan
  assets: Asset[]
  onRestart?: () => void
}

export default function ScanResultsView({ scan, assets, onRestart }: Props) {
  const totalPorts  = assets.reduce((acc, a) => acc + (a.openPorts?.length ?? 0), 0)
  const allCves     = assets.flatMap((a) => a.cves ?? [])
  const highCves    = allCves.filter((c: any) => c.cvss !== null && c.cvss >= 7).length
  const duration    = formatDuration(scan.startedAt, scan.completedAt)
  const targetsLabel = scan.targets.map((t: any) => t.target).join(", ")

  // Grouper par catégorie
  const grouped = assets.reduce<Record<CategoryKey, Asset[]>>((acc, asset) => {
    const key = categorize(asset)
    acc[key] = [...(acc[key] ?? []), asset]
    return acc
  }, {} as Record<CategoryKey, Asset[]>)

  const metrics = [
    { label: "Assets",       value: assets.length, icon: Globe,   danger: false },
    { label: "Ports ouverts", value: totalPorts,   icon: Server,  danger: false },
    { label: "CVEs ≥ 7.0",   value: highCves,      icon: Shield,  danger: true  },
    { label: "Durée",         value: duration,      icon: Clock,   danger: false },
  ]

  return (
    <div className="w-full mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="relative rounded-2xl overflow-hidden px-6 py-8 min-h-[180px]">
        <img src="/images/hero.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-primary)" }} />
        <div className="absolute right-8 top-0 bottom-0 flex items-center select-none pointer-events-none">
          <span className="text-[140px] opacity-40 drop-shadow-2xl">🦎</span>
        </div>
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            <StatusBadge status={scan.status} />
            <h2 className="valenzka text-white text-3xl leading-tight">{scan.name}</h2>
            <p className="text-sm text-white/70 flex items-center gap-2 flex-wrap">
              <span>{targetsLabel}</span>
              <span className="text-white/40">·</span>
              <span className="capitalize">{scan.scanType} scan</span>
              <span className="text-white/40">·</span>
              <span>Durée {duration}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Métriques ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon
          const isDanger = m.danger && Number(m.value) > 0
          return (
            <div key={m.label} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{m.label}</p>
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    background: isDanger ? "oklch(0.62 0.21 25 / 0.15)" : "color-mix(in oklch, var(--gradient-from) 15%, transparent)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: isDanger ? "oklch(0.62 0.21 25)" : "var(--gradient-from)" }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: isDanger ? "oklch(0.62 0.21 25)" : "var(--foreground)" }}>
                {m.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Assets par catégorie ── */}
      <div className="space-y-3">
        {CATEGORIES.map((cat, i) => (
          <CategorySection
            key={cat.key}
            category={cat}
            assets={grouped[cat.key] ?? []}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Terminé le {formatDate(scan.completedAt)}
        </p>
        <div className="flex items-center gap-2">
          {onRestart && (
            <Button variant="outline" size="sm" onClick={onRestart}>
              <RefreshCw className="h-3.5 w-3.5" />
              Relancer
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" />
            Exporter
          </Button>
        </div>
      </div>
    </div>
  )
}