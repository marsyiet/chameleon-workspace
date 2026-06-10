"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Monitor,
  Database,
  Globe,
  Lock,
  Plug,
  AlertTriangle,
  TerminalIcon,
} from "lucide-react"
import { Asset} from "@/app/[locale]/scans/_constants/data-types"
import { CveList } from "./cve-list"

function osIcon(os: string | null) {
  if (!os) return <Monitor className="w-5 h-5" />
  const l = os.toLowerCase()
  if (l.includes("windows")) return <Monitor className="w-5 h-5" />
  return <Monitor className="w-5 h-5" />
}

function serviceIcon(service: string) {
  const map: Record<string, React.ReactNode> = {
    ssh:        <TerminalIcon className="w-3.5 h-3.5" />,
    mysql:      <Database className="w-3.5 h-3.5" />,
    postgresql: <Database className="w-3.5 h-3.5" />,
    mongodb:    <Database className="w-3.5 h-3.5" />,
    redis:      <Database className="w-3.5 h-3.5" />,
    http:       <Globe className="w-3.5 h-3.5" />,
    https:      <Lock className="w-3.5 h-3.5" />,
  }
  return map[service] ?? <Plug className="w-3.5 h-3.5" />
}

function cvssVariant(score: number | null) {
  if (score === null) return "bg-muted text-muted-foreground"
  if (score >= 9) return "bg-red-100/10 text-red-900"
  if (score >= 7) return "bg-red-50/10 text-destructive"
  if (score >= 4) return "bg-amber-50/10 text-amber-800"
  return "bg-green-50/10 text-green-800"
}

interface Props {
  asset: Asset
}

export function AssetRow({ asset }: Props) {
  const [open, setOpen] = useState(false)

  const highCves = asset.cves.filter(
    (c) => c.cvss !== null && c.cvss >= 7
  )
  const topCve = [...asset.cves]
    .filter((c) => c.cvss !== null)
    .sort((a, b) => (b.cvss ?? 0) - (a.cvss ?? 0))[0]

  const geo =
    asset.geo?.country
      ? [asset.geo.city, asset.geo.country]
          .filter(Boolean)
          .join(", ")
      : null

  return (
    <div
      className="
        bg-background border border-border rounded-xl
        px-5 py-4 cursor-pointer
        transition-colors hover:border-border/80
      "
      onClick={() => setOpen((o) => !o)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground shrink-0">
            {osIcon(asset.os)}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium font-mono">
                {asset.ip}
              </span>
              {asset.rdns && (
                <span className="text-xs text-muted-foreground">
                  {asset.rdns}
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
            <span
              className={`
                text-[11px] font-medium px-2 py-0.5 rounded-full
                ${cvssVariant(topCve.cvss)}
              `}
            >
              CVSS {topCve.cvss?.toFixed(1)}
            </span>
          )}
          <span className="text-muted-foreground/60">
            {open
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </span>
        </div>
      </div>

      {/* Detail */}
      {open && (
        <div
          className="mt-4 pt-4 border-t border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Ports ouverts
              </p>
              <div className="flex flex-wrap gap-1">
                {asset.openPorts.map((p) => (
                  <span
                    key={p}
                    className="
                      text-[11px] font-mono px-2 py-0.5 rounded-full
                      bg-secondary text-secondary-foreground border border-border
                    "
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Système
              </p>
              <p className="text-xs text-foreground">
                {asset.os ?? "—"}
              </p>
            </div>

            {geo && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Localisation
                </p>
                <p className="text-xs text-foreground">{geo}</p>
                {asset.asn?.org && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {asset.asn.asn} · {asset.asn.org}
                  </p>
                )}
              </div>
            )}

            {asset.http?.title && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  HTTP
                </p>
                <p className="text-xs text-foreground">
                  {asset.http.title}
                </p>
                {(asset.http.server || asset.http.statusCode) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[asset.http.server, asset.http.statusCode]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="border-t border-border pt-4 mb-4">
            <p className="text-xs text-muted-foreground mb-2">
              Services détectés
            </p>
            <div className="divide-y divide-border">
              {asset.services.map((svc) => (
                <div
                  key={svc.port}
                  className="flex items-center gap-2 py-1.5 text-xs"
                >
                  <span className="text-muted-foreground shrink-0">
                    {serviceIcon(svc.service)}
                  </span>
                  <span className="
                    font-mono px-2 py-0.5 rounded-full shrink-0
                    bg-secondary text-secondary-foreground border border-border
                    text-[11px]
                  ">
                    {svc.port}/{svc.protocol}
                  </span>
                  <span className="text-foreground">
                    {svc.product || svc.service}
                    {svc.version && (
                      <span className="text-muted-foreground ml-1">
                        {svc.version}
                      </span>
                    )}
                  </span>
                  {svc.banner && (
                    <span className="
                      ml-auto text-muted-foreground truncate max-w-[180px]
                    ">
                      {svc.banner}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CVEs */}
          {asset.cves.length > 0 && (
            <div className="border-t border-border pt-4">
              <CveList cves={asset.cves} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}