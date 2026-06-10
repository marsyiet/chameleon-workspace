"use client"

import { useState } from "react"
import { Download, RefreshCw, Sparkles } from "lucide-react"
import { Asset, Scan} from "@/app/[locale]/scans/_constants/data-types"
import { AssetRow } from "./asset-row"

type Filter = "all" | "cves" | "db" | "ssh"

function formatDuration(
  start: string | null,
  end: string | null
): string {
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

function statusPill(status: Scan["status"]) {
  const map = {
    completed: "bg-green/50 text-green-800",
    running:   "bg-blue/50 text-blue-800",
    pending:   "bg-secondary text-secondary-foreground",
    failed:    "bg-red/50 text-red-800",
  }
  return map[status] ?? map.pending
}

interface Props {
  scan: Scan
  assets: Asset[]
  onRestart?: () => void
}

export default function ScanResultsView({
  scan,
  assets,
  onRestart,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all")

  const totalPorts = assets.reduce(
    (acc, a) => acc + a.openPorts.length, 0
  )
  const allCves = assets.flatMap((a) => a.cves)
  const highCves = allCves.filter(
    (c) => c.cvss !== null && c.cvss >= 7
  ).length
  const duration = formatDuration(
    scan.startedAt,
    scan.completedAt
  )
  const targetsLabel = scan.targets
    .map((t) => t.target)
    .join(", ")

  const filtered = assets.filter((a) => {
    if (filter === "cves")
      return a.cves.some((c:any) => c.cvss !== null && c.cvss >= 7)
    if (filter === "db")
      return a.tags.some((t:any) => t.startsWith("database/"))
    if (filter === "ssh")
      return a.tags.includes("remote/ssh")
    return true
  })

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",  label: `Tous (${assets.length})` },
    { key: "cves", label: "CVEs critiques" },
    { key: "db",   label: "Bases de données" },
    { key: "ssh",  label: "SSH exposé" },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-lg font-medium">
              {scan.name}
            </h1>
            <span
              className={`
                text-xs font-medium px-2.5 py-0.5 rounded-full
                ${statusPill(scan.status)}
              `}
            >
              {scan.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {targetsLabel}
            {" · "}
            {scan.scanType} scan
            {" · "}
            durée {duration}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="
              inline-flex items-center gap-1.5 text-sm
              px-3 py-1.5 rounded-lg border border-border
              hover:bg-secondary transition-colors
            "
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyser
          </button>
          {onRestart && (
            <button
              onClick={onRestart}
              className="
                inline-flex items-center gap-1.5 text-sm
                px-3 py-1.5 rounded-lg border border-border
                hover:bg-secondary transition-colors
              "
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Relancer
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Assets", value: assets.length, danger: false },
          { label: "Ports ouverts", value: totalPorts, danger: false },
          { label: "CVEs ≥ 7.0", value: highCves, danger: true },
          { label: "Durée", value: duration, danger: false },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-secondary rounded-lg p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">
              {m.label}
            </p>
            <p
              className={`
                text-2xl font-medium
                ${m.danger && Number(m.value) > 0
                  ? "text-destructive"
                  : "text-foreground"}
              `}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`
              text-xs px-3 py-1.5 rounded-lg border transition-colors
              ${filter === f.key
                ? "bg-secondary border-border text-foreground"
                : "border-border text-muted-foreground hover:bg-secondary"}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Asset list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Aucun asset dans ce filtre.
          </p>
        ) : (
          filtered.map((asset) => (
            <AssetRow key={asset._id} asset={asset} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="
        flex items-center justify-between pt-4
        border-t border-border
      ">
        <p className="text-xs text-muted-foreground">
          Terminé le {formatDate(scan.completedAt)}
        </p>
        <button className="
          inline-flex items-center gap-1.5 text-xs
          px-3 py-1.5 rounded-lg border border-border
          hover:bg-secondary transition-colors
        ">
          <Download className="w-3.5 h-3.5" />
          Exporter
        </button>
      </div>
    </div>
  )
}