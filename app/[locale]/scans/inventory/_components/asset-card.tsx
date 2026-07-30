"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin, ChevronDown, Server, Globe2, Clock,
  Database, Lock, TerminalIcon, KeyRound, Code2,
  Shield, Mail, Network, FileText, Cpu, Radio, Plug,
  AlertTriangle, ArrowUpRight, UserCheck,
} from "lucide-react"
import { Asset } from "@/types/asset"
import { cn } from "@/lib/utils"

const SEVERITY_CONFIG: Record<string, { label: string; text: string; bg: string; bar: string }> = {
  critical: { label: "Critique", text: "text-red-600 dark:text-red-400", bg: "bg-red-500/15", bar: "bg-red-500" },
  high:     { label: "Élevé", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/15", bar: "bg-orange-500" },
  medium:   { label: "Moyen", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/15", bar: "bg-amber-500" },
  low:      { label: "Faible", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/15", bar: "bg-blue-500" },
  informational: { label: "Info", text: "text-muted-foreground", bg: "bg-muted", bar: "bg-muted-foreground/50" },
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

const OWNER_SOURCE_LABEL: Record<string, string> = {
  declared:     "Déclaré",
  tls_subject:  "Certificat TLS",
  tls_san:      "Certificat TLS (SAN)",
  rdns:         "DNS inverse",
  hostname:     "Nom d'hôte",
  http_title:   "Titre de page",
  banner:       "Bannière",
  snmp_sysname: "SNMP",
  whois_ip:     "WHOIS",
}

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
  const severity = SEVERITY_CONFIG[asset.severity] ?? SEVERITY_CONFIG.informational
  const identity = asset.identity ?? {}
  const authCount = asset.authenticationSurfaces?.length ?? 0
  const ownerOrg = (asset as any).ownerOrganization

  const goToDetail = () => router.push(`/scans/${asset.lastScanId}/asset/${asset._id}`)

  return (
    <div
      className={cn(
        "group/card relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200",
        "hover:bg-secondary/30 hover:border-border/80 shadow-sm hover:shadow-md",
        className
      )}
    >
      {/* ── Entête cliquable ── */}
      <div onClick={goToDetail} className="p-5 space-y-3 cursor-pointer select-none">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 group-hover/card:text-primary transition-colors">
              <h4 className="font-mono text-foreground truncate leading-snug">{primary}</h4>
              <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover/card:opacity-100 transition-all text-muted-foreground shrink-0" />
            </div>
            {secondary && (
              <p className="text-sm font-mono text-muted-foreground truncate mt-0.5">{secondary}</p>
            )}
            {/* Organisation exploitante sous le hostname */}
            {ownerOrg && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate font-medium text-foreground">{ownerOrg.name}</span>
                <span className="text-xs shrink-0">· {OWNER_SOURCE_LABEL[ownerOrg.source] ?? ownerOrg.source}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className={cn("rounded-lg px-3 py-1.5 text-base font-bold tabular-nums border border-border/40", severity.bg, severity.text)}>
              {asset.riskScore?.value?.toFixed(1) ?? "0.0"}
            </span>
            <span className="text-xs text-muted-foreground mt-1 uppercase font-semibold tracking-wider">Score</span>
          </div>
        </div>

        {/* Badges de rôles */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-medium bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/20">
            <PrimaryIcon className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
            {ROLE_LABEL[primaryRole] ?? primaryRole}
          </span>
          {secondaryRoles.slice(0, 2).map((r: any) => {
            const Icon = ROLE_ICON[r.role] ?? Server
            return (
              <span key={r.role} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium bg-muted text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {ROLE_LABEL[r.role] ?? r.role}
              </span>
            )
          })}
          {secondaryRoles.length > 2 && (
            <span className="text-sm text-muted-foreground font-medium">+{secondaryRoles.length - 2}</span>
          )}
        </div>

        {/* Identité fabricant */}
        {identity.vendor && (
          <p className="text-sm text-muted-foreground truncate">
            <span className="font-medium text-foreground">{identity.vendor}</span>
            {identity.model && <span className="ml-1.5">{identity.model}</span>}
            {identity.deviceLabel && <span className="ml-1.5 font-mono">({identity.deviceLabel})</span>}
          </p>
        )}
      </div>

      {/* ── Métriques ── */}
      <div className="px-5 pb-4 space-y-4">
        <div className="grid grid-cols-3 py-3 border-y-2 border-dashed border-border text-sm">
          <div className="pr-2">
            <p className="text-xs text-muted-foreground font-medium">Sévérité</p>
            <p className={cn("font-medium mt-0.5 text-sm", severity.text)}>{severity.label}</p>
          </div>
          <div className="px-3 border-x-2 border-dashed border-border">
            <p className="text-xs text-muted-foreground font-medium">Services</p>
            <p className="font-medium text-foreground mt-0.5 text-sm">{services.length}</p>
          </div>
          <div className="pl-3">
            <p className="text-xs text-muted-foreground font-medium">CVE</p>
            <p className={cn("font-medium mt-0.5 text-sm", cveCount > 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
              {cveCount > 0 ? `${cveCount} (${highCveCount} High)` : "Aucune"}
            </p>
          </div>
        </div>

        {(asset.geo?.city || authCount > 0) && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {asset.geo?.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                {[asset.geo.city, asset.geo.country].filter(Boolean).join(", ")}
              </span>
            )}
            {authCount > 0 && (
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                <KeyRound className="h-4 w-4" />
                {authCount} surface{authCount > 1 ? "s" : ""} d'auth
              </span>
            )}
          </div>
        )}

        {/* Accordéon */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
          className="w-full flex items-center justify-between text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors pt-3 border-t-2 border-dashed border-border"
        >
          <span>Détails de l'actif</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
        </button>

        {expanded && (
          <div className="space-y-3 pt-1 text-sm">
            {services.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Ports ouverts</p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((svc) => (
                    <span
                      key={`${svc.port}-${svc.protocol}`}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground border border-border"
                    >
                      {svc.port}/{svc.protocol}
                      {svc.product && <span className="text-muted-foreground">· {svc.product}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(asset.subdomainsDiscovered?.length ?? 0) > 0 && (
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">{asset.subdomainsDiscovered!.length}</span> sous-domaine(s) découvert(s)
              </p>
            )}

            {asset.humanVector?.exposed && (
              <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Point d'authentification exposé
              </p>
            )}

            {asset.os && (
              <p className="text-muted-foreground">
                Système : <span className="text-foreground font-medium">{asset.os}</span>
              </p>
            )}

            <div className="flex items-center gap-2 text-muted-foreground pt-1">
              <Clock className="h-4 w-4" />
              Dernière détection : {new Date(asset.lastSeenAt).toLocaleDateString("fr-FR")}
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToDetail() }}
              className="w-full text-center font-semibold text-sm text-primary hover:underline pt-3 border-t-2 border-dashed border-border flex items-center justify-center gap-1.5"
            >
              Voir la fiche complète <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Barre animée */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-border/40 overflow-hidden">
        <div
          className={cn(
            "h-full w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover/card:scale-x-100",
            severity.bar
          )}
        />
      </div>
    </div>
  )
}