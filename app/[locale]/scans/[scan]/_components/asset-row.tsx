"use client"

import { Monitor, AlertTriangle, ChevronRight } from "lucide-react"
import { Asset, AssetCVE } from "@/app/[locale]/scans/_constants/data-types"

function cvssVariant(score: number | null) {
  if (score === null) return "bg-muted text-muted-foreground"
  if (score >= 9) return "bg-red-100/10 text-red-900"
  if (score >= 7) return "bg-red-50/10 text-destructive"
  if (score >= 4) return "bg-amber-50/10 text-amber-800"
  return "bg-green-50/10 text-green-800"
}

interface Props {
  asset: Asset
  onClick?: () => void
}

export function AssetRow({ asset, onClick }: Props) {
  const allCves: AssetCVE[] = asset.services.flatMap((svc) => svc.cves ?? [])
  const highCves = allCves.filter((c) => c.cvss !== null && c.cvss >= 7 && c.status === "valid")
  const topCve = [...allCves]
    .filter((c) => c.cvss !== null && c.status === "valid")
    .sort((a, b) => (b.cvss ?? 0) - (a.cvss ?? 0))[0]

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full flex items-center justify-between gap-3 flex-wrap
        bg-background border border-border rounded-xl
        px-5 py-4 text-left
        transition-colors hover:border-border/80 hover:bg-secondary/30
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-muted-foreground shrink-0">
          <Monitor className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium font-mono truncate">
              {asset.hostname || asset.ipAddress}
            </span>
            {asset.hostname && (
              <span className="text-xs text-muted-foreground font-mono">
                {asset.ipAddress}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {asset.tags.map((tag) => (
              <span
                key={tag}
                className="
                  text-[11px] px-2 py-0.5 rounded-full font-medium
                  bg-secondary text-secondary-foreground
                  border border-border
                "
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {highCves.length > 0 && (
          <span className="
            inline-flex items-center gap-1 text-[11px] font-medium
            px-2 py-0.5 rounded-full
            bg-red-50/10 text-destructive
          ">
            <AlertTriangle className="w-3 h-3" />
            {highCves.length} CVE haute
          </span>
        )}
        {topCve && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cvssVariant(topCve.cvss)}`}>
            CVSS {topCve.cvss?.toFixed(1)}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
      </div>
    </button>
  )
}