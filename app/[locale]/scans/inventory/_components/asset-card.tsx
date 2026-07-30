"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin, ChevronDown, Server, Globe2, Clock,
  Database, Lock, TerminalIcon, KeyRound, Code2,
  Shield, Mail, Network, FileText, Cpu, Radio, Plug,
  AlertTriangle,
} from "lucide-react"
import { Asset } from "@/types/asset"
import { cn } from "@/lib/utils"

/* ── Style ───────────────────────────────────────────────────────────── */

const SEVERITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400", label: "Critique" },
  high:     { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", label: "Élevé" },
  medium:   { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", label: "Moyen" },
  low:      { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", label: "Faible" },
  informational: { bg: "bg-muted", text: "text-muted-foreground", label: "Info" },
}

const ROLE_LABEL: Record<string, string> = {
  firewall_router: "Pare-feu / Routeur",
  vpn_gateway: "Passerelle VPN",
  industrial_control: "Contrôle industriel",
  database: "Base de données",
  remote_access: "Accès distant",
  mail_server: "Serveur mail",
  dns_server: "Serveur DNS",
  file_transfer: "Transfert de fichiers",
  authentication_portal: "Portail d'auth.",
  api: "API",
  devops_tool: "Outil DevOps",
  iot_device: "Objet connecté",
  network_device_generic: "Équipement réseau",
  web_application: "Application web",
  unknown: "Non identifié",
}

const ROLE_ICON: Record<string, any> = {
  firewall_router: Shield,
  vpn_gateway: Lock,
  database: Database,
  remote_access: TerminalIcon,
  mail_server: Mail,
  dns_server: Network,
  file_transfer: FileText,
  authentication_portal: KeyRound,
  api: Code2,
  web_application: Globe2,
  network_device_generic: Cpu,
  unknown: Server,
}

const ROLE_TAG = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
const ROLE_TAG_PRIMARY = "bg-amber-500/20 text-amber-900 dark:bg-amber-500/25 dark:text-amber-200 font-semibold"

/* ── Composant ───────────────────────────────────────────────────────── */

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

  const primaryRole = asset.primaryRoleForDisplay ?? "unknown"
  const PrimaryIcon = ROLE_ICON[primaryRole] ?? Server
  const roles = asset.natureRoles ?? []
  const secondaryRoles = roles.filter((r: any) => r.role !== primaryRole)
  const severity = SEVERITY_STYLE[asset.severity] ?? SEVERITY_STYLE.informational
  const identity = asset.identity ?? {}
  const authCount = asset.authenticationSurfaces?.length ?? 0

  const goToDetail = () => router.push(`/scans/${asset.lastScanId}/asset/${asset._id}`)

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md", className)}>

      {/* ── Header ── */}
      <div onClick={goToDetail} className="bg-muted/50 px-5 py-4 space-y-3 cursor-pointer">

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <PrimaryIcon className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold font-mono text-foreground truncate leading-tight">{primary}</p>
              {secondary && <p className="text-sm font-mono text-muted-foreground truncate mt-0.5">{secondary}</p>}
            </div>
          </div>
          <span className={cn("shrink-0 rounded-lg px-2.5 py-1.5 text-base font-bold tabular-nums", severity.bg, severity.text)}>
            {asset.riskScore?.value?.toFixed(1) ?? "0.0"}
          </span>
        </div>

        {/* Rôles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm", ROLE_TAG_PRIMARY)}>
            <PrimaryIcon className="h-3.5 w-3.5" />
            {ROLE_LABEL[primaryRole] ?? primaryRole}
          </span>
          {secondaryRoles.slice(0, 2).map((r: any) => {
            const Icon = ROLE_ICON[r.role] ?? Server
            return (
              <span key={r.role} className={cn("inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm", ROLE_TAG)}>
                <Icon className="h-3.5 w-3.5" />
                {ROLE_LABEL[r.role] ?? r.role}
              </span>
            )
          })}
          {secondaryRoles.length > 2 && (
            <span className="text-sm text-muted-foreground">+{secondaryRoles.length - 2}</span>
          )}
        </div>

        {/* Identité fabricant */}
        {identity.vendor && (
          <p className="text-sm text-muted-foreground">
            {identity.vendor}
            {identity.model && <span className="ml-1.5">{identity.model}</span>}
            {identity.deviceLabel && <span className="ml-1.5 font-mono">({identity.deviceLabel})</span>}
          </p>
        )}
      </div>

      {/* ── Corps ── */}
      <div className="px-5 py-4 space-y-4">

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Sévérité</p>
            <p className={cn("text-sm font-semibold mt-0.5", severity.text)}>{severity.label}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Services</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{services.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">CVE</p>
            <p className={cn("text-sm font-semibold mt-0.5", cveCount > 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
              {cveCount > 0 ? `${cveCount} (${highCveCount} ≥ 7.0)` : "Aucune"}
            </p>
          </div>
        </div>

        {(asset.geo?.city || authCount > 0) && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {asset.geo?.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                {[asset.geo.city, asset.geo.country].filter(Boolean).join(", ")}
              </span>
            )}
            {authCount > 0 && (
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <KeyRound className="h-3.5 w-3.5" />
                {authCount} surface{authCount > 1 ? "s" : ""} d'auth.
              </span>
            )}
          </div>
        )}

        {/* Accordéon */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
          className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pt-2 border-t border-dashed border-border/60"
        >
          Détails
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </button>

        {expanded && (
          <div className="space-y-3 pt-1">

            {services.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Ports ouverts</p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((svc) => (
                    <span key={`${svc.port}-${svc.protocol}`} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-sm font-mono text-secondary-foreground">
                      {svc.port}/{svc.protocol}
                      {svc.product && <span className="text-muted-foreground ml-1">· {svc.product}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(asset.subdomainsDiscovered?.length ?? 0) > 0 && (
              <p className="text-sm text-muted-foreground">
                {asset.subdomainsDiscovered!.length} sous-domaine(s) découvert(s)
              </p>
            )}

            {asset.humanVector?.exposed && (
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Point d'authentification exposé
              </p>
            )}

            {asset.os && (
              <p className="text-sm text-muted-foreground">
                Système : <span className="text-foreground">{asset.os}</span>
              </p>
            )}

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Dernière détection : {new Date(asset.lastSeenAt).toLocaleDateString("fr-FR")}
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToDetail() }}
              className="w-full text-center text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline pt-2 border-t border-dashed border-border/60"
            >
              Voir le détail complet →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}