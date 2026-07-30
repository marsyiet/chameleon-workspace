"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  ArrowLeft, Globe, Database, Lock, Plug, TerminalIcon,
  MapPin, Server, Clock, Building2, Tag, Network, ShieldAlert,
  KeyRound, FileText, Radio, Code2, Mail, Link2, Cpu,
  Fingerprint, Eye, Shield, AlertTriangle, CheckCircle2,
} from "lucide-react"
import { useAsset } from "@/hooks/assets/use-asset"
import { Button } from "@/components/ui/button"
import LoaderGlobal from "../../../_components/loader-global"
import { CveList } from "../../_components/cve-list"
import { cn } from "@/lib/utils"

/* ── Constantes de style ─────────────────────────────────────────────── */

const SEVERITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400", label: "Critique" },
  high:     { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", label: "Élevé" },
  medium:   { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", label: "Moyen" },
  low:      { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", label: "Faible" },
  informational: { bg: "bg-muted", text: "text-muted-foreground", label: "Informationnel" },
}

const CONFIDENCE_LABEL: Record<string, string> = {
  certaine: "Certaine",
  probable: "Probable",
  faible: "Faible",
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
  authentication_portal: "Portail d'authentification",
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
  web_application: Globe,
  network_device_generic: Cpu,
  unknown: Server,
}

/* Tag orange-chaud pour les rôles */
const ROLE_TAG = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
const ROLE_TAG_PRIMARY = "bg-amber-500/20 text-amber-900 dark:bg-amber-500/25 dark:text-amber-200 font-semibold"

/* ── Composants utilitaires ──────────────────────────────────────────── */

function Dashed() {
  return <div className="border-t border-dashed border-border/60 my-4" />
}

function Field({ label, value, mono = false }: { label: string; value: any; mono?: boolean }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return null
  const display = Array.isArray(value) ? value.join(", ") : String(value)
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-sm text-foreground text-right break-all", mono && "font-mono")}>{display}</span>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
    </div>
  )
}

function serviceIcon(service: string | undefined) {
  const map: Record<string, React.ReactNode> = {
    ssh: <TerminalIcon className="w-4 h-4" />,
    mysql: <Database className="w-4 h-4" />,
    postgresql: <Database className="w-4 h-4" />,
    mongodb: <Database className="w-4 h-4" />,
    redis: <Database className="w-4 h-4" />,
    http: <Globe className="w-4 h-4" />,
    https: <Lock className="w-4 h-4" />,
    ftp: <FileText className="w-4 h-4" />,
    snmp: <Radio className="w-4 h-4" />,
  }
  return map[service ?? ""] ?? <Plug className="w-4 h-4" />
}

/* ── Mini-carte Leaflet ──────────────────────────────────────────────── */

function LocationCard({ asset }: { asset: any }) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const hasGeo = asset.geo?.lat != null && asset.geo?.lon != null

  useEffect(() => {
    if (!hasGeo || !mapDivRef.current || mapRef.current) return
    const isDark = document.documentElement.classList.contains("dark")
    const coords: [number, number] = [asset.geo.lat, asset.geo.lon]

    const map = L.map(mapDivRef.current, {
      center: coords, zoom: 9, zoomControl: false, dragging: false,
      scrollWheelZoom: false, doubleClickZoom: false, attributionControl: false,
    })
    L.tileLayer(
      isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map)
    L.circleMarker(coords, { radius: 8, color: "#fff", weight: 2, fillColor: "#f59e0b", fillOpacity: 1 }).addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [hasGeo, asset.geo?.lat, asset.geo?.lon])

  return (
    <div className="relative w-full sm:w-60 shrink-0 rounded-xl overflow-hidden border border-border">
      {hasGeo ? (
        <div ref={mapDivRef} className="h-28 w-full" />
      ) : (
        <div className="h-28 w-full flex items-center justify-center bg-muted">
          <MapPin className="h-5 w-5 text-muted-foreground/40" />
        </div>
      )}
      <div className="bg-card px-4 py-3">
        {hasGeo ? (
          <>
            <p className="text-sm font-semibold text-foreground">
              {[asset.geo.city, asset.geo.country].filter(Boolean).join(", ") || "Localisation inconnue"}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {asset.geo.lat.toFixed(3)}, {asset.geo.lon.toFixed(3)}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Non géolocalisé</p>
        )}
      </div>
    </div>
  )
}

/* ── Page principale ─────────────────────────────────────────────────── */

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.assetId as string
  const { data: asset, isLoading } = useAsset(assetId)

  if (isLoading) return <div className="w-full h-full flex items-center justify-center"><LoaderGlobal /></div>
  if (!asset) return <div className="p-8 text-muted-foreground">Actif introuvable</div>

  const allCves = asset.services.flatMap((svc: any) => svc.cves ?? [])
  const severity = SEVERITY_STYLE[asset.severity] ?? SEVERITY_STYLE.informational
  const primaryRole = asset.primaryRoleForDisplay ?? "unknown"
  const PrimaryIcon = ROLE_ICON[primaryRole] ?? Server
  const roles = asset.natureRoles ?? []
  const identity = asset.identity ?? {}
  const authSurfaces = asset.authenticationSurfaces ?? []
  const hasDns = asset.dns && (asset.dns.a?.length || asset.dns.aaaa?.length || asset.dns.mx?.length || asset.dns.ns?.length || asset.dns.txt?.length)
  const hasSubdomains = (asset.subdomainsDiscovered?.length ?? 0) > 0
  const hasWhois = asset.whois?.ipNetwork?.name || asset.whois?.domain?.registrar

  return (
    <div className="w-full mx-auto space-y-6">

      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux résultats
      </Button>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className="rounded-2xl border border-border bg-card px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex-1 min-w-0 space-y-4">

            {/* Titre + IP */}
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                <PrimaryIcon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">{asset.hostname || asset.ipAddress}</h2>
                {asset.hostname && <p className="text-sm text-muted-foreground font-mono mt-0.5">{asset.ipAddress}</p>}
              </div>
            </div>

            {/* Rôles (tags orange) */}
            <div className="flex flex-wrap items-center gap-2">
              {roles.map((r: any) => {
                const Icon = ROLE_ICON[r.role] ?? Server
                const isPrimary = r.role === primaryRole
                return (
                  <span key={r.role} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm", isPrimary ? ROLE_TAG_PRIMARY : ROLE_TAG)}>
                    <Icon className="h-3.5 w-3.5" />
                    {ROLE_LABEL[r.role] ?? r.role}
                  </span>
                )
              })}
              <span className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", severity.bg, severity.text)}>
                {severity.label}
              </span>
            </div>

            {/* Identité fabricant */}
            {identity.vendor && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-foreground font-medium">{identity.vendor}</span>
                {identity.model && <span className="text-muted-foreground">{identity.model}</span>}
                {identity.deviceLabel && <span className="text-muted-foreground font-mono">({identity.deviceLabel})</span>}
                {identity.firmwareVersion && <span className="text-muted-foreground">v{identity.firmwareVersion}</span>}
                <span className="text-xs text-muted-foreground/70">confiance : {CONFIDENCE_LABEL[identity.vendorConfidence] ?? identity.vendorConfidence}</span>
              </div>
            )}

            {/* Tags techniques */}
            {(asset.tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((t: string) => (
                  <span key={t} className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground font-mono">{t}</span>
                ))}
              </div>
            )}
          </div>

          <LocationCard asset={asset} />
        </div>

        <Dashed />

        {/* Stats clés */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Score de risque</p>
            <p className={cn("text-2xl font-bold", severity.text)}>
              {asset.riskScore.value.toFixed(1)} <span className="text-base font-normal text-muted-foreground">/ 10</span>
            </p>
            {asset.riskScore.reasoning && (
              <p className="text-xs text-muted-foreground mt-1">{asset.riskScore.reasoning}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Exposition</p>
            <p className="text-base font-semibold text-foreground capitalize">{asset.exposure}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Services</p>
            <p className="text-base font-semibold text-foreground">{asset.services.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Système</p>
            <p className="text-base font-semibold text-foreground truncate">{asset.os ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════ DÉTAILS ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Rôles et preuves ── */}
        {roles.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle icon={Fingerprint} title="Rôles détectés" />
            <div className="space-y-3">
              {roles.map((r: any) => {
                const Icon = ROLE_ICON[r.role] ?? Server
                return (
                  <div key={r.role}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-semibold text-foreground">{ROLE_LABEL[r.role] ?? r.role}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{CONFIDENCE_LABEL[r.confidence] ?? r.confidence}</span>
                    </div>
                    {(r.evidence?.length ?? 0) > 0 && (
                      <ul className="ml-6 space-y-0.5">
                        {r.evidence.map((e: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">— {e}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Attribution ── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionTitle icon={Building2} title="Attribution" />
          <p className="text-base font-semibold text-foreground">{asset.attribution?.guessedOrganizationName ?? "Non attribué"}</p>
          {asset.attribution?.confidence && (
            <p className="text-sm text-muted-foreground mt-1">Confiance : {CONFIDENCE_LABEL[asset.attribution.confidence] ?? asset.attribution.confidence}</p>
          )}
          {(asset.attribution?.signals?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {asset.attribution.signals.map((s: string) => (
                <span key={s} className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground font-mono">{s}</span>
              ))}
            </div>
          )}
          {asset.asn?.org && <p className="text-sm text-muted-foreground mt-3">{asset.asn.asn} · {asset.asn.org}</p>}
        </div>

        {/* ── Surfaces d'authentification ── */}
        {authSurfaces.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle icon={KeyRound} title={`Surfaces d'authentification (${authSurfaces.length})`} />
            <div className="space-y-3">
              {authSurfaces.map((s: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-sm font-mono font-bold px-2 py-1 rounded-lg bg-secondary border border-border shrink-0">
                    {s.port}/{s.protocol}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.method}</p>
                    {s.note && <p className="text-sm text-muted-foreground">{s.note}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">Confiance : {CONFIDENCE_LABEL[s.confidence] ?? s.confidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Suivi ── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionTitle icon={Clock} title="Suivi" />
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Première détection : <span className="text-foreground font-medium">{new Date(asset.firstSeenAt).toLocaleDateString("fr-FR")}</span>
            </p>
            <p className="text-muted-foreground">
              Dernière vue : <span className="text-foreground font-medium">{new Date(asset.lastSeenAt).toLocaleDateString("fr-FR")}</span>
            </p>
            {asset.humanVector?.exposed && (
              <p className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5 mt-2">
                <AlertTriangle className="h-4 w-4" />
                Point d'authentification exposé
              </p>
            )}
          </div>
        </div>

        {/* ── WHOIS ── */}
        {hasWhois && (
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle icon={FileText} title="WHOIS" />
            <div className="space-y-2 text-sm">
              {asset.whois?.ipNetwork?.name && (
                <p className="text-muted-foreground">Bloc IP : <span className="text-foreground font-medium">{asset.whois.ipNetwork.name}</span></p>
              )}
              {asset.whois?.domain?.registrar && (
                <p className="text-muted-foreground">Registrar : <span className="text-foreground font-medium">{asset.whois.domain.registrar}</span></p>
              )}
              {asset.whois?.domain?.expiresAt && (
                <p className="text-muted-foreground">Expire le : <span className="text-foreground font-medium">{new Date(asset.whois.domain.expiresAt).toLocaleDateString("fr-FR")}</span></p>
              )}
              {(asset.whois?.domain?.nameservers?.length ?? 0) > 0 && (
                <p className="text-muted-foreground">NS : <span className="text-foreground font-mono text-xs">{asset.whois.domain.nameservers.join(", ")}</span></p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DNS ── */}
      {hasDns && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionTitle icon={Network} title="Enregistrements DNS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div className="divide-y divide-dashed divide-border/60">
              <Field label="IPv4 (A)" value={asset.dns.a} mono />
              <Field label="IPv6 (AAAA)" value={asset.dns.aaaa} mono />
              <Field label="Mail (MX)" value={asset.dns.mx} mono />
              <Field label="Noms (NS)" value={asset.dns.ns} mono />
            </div>
            <div className="divide-y divide-dashed divide-border/60">
              <Field label="TXT" value={asset.dns.txt} mono />
              {asset.dns.spfValid !== null && asset.dns.spfValid !== undefined && (
                <Field label="SPF" value={asset.dns.spfValid ? "Valide" : "Absent"} />
              )}
              {asset.dns.dmarcPresent !== null && asset.dns.dmarcPresent !== undefined && (
                <Field label="DMARC" value={asset.dns.dmarcPresent ? "Présent" : "Absent"} />
              )}
              {asset.dns.zoneTransferVulnerable !== null && asset.dns.zoneTransferVulnerable !== undefined && (
                <Field label="Transfert de zone" value={asset.dns.zoneTransferVulnerable ? "⚠ Vulnérable (AXFR)" : "Non vulnérable"} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sous-domaines ── */}
      {hasSubdomains && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionTitle icon={Globe} title={`Sous-domaines découverts (${asset.subdomainsDiscovered.length})`} />
          <div className="flex flex-wrap gap-2">
            {asset.subdomainsDiscovered.map((s: any) => (
              <span key={s.subdomain} className="text-sm px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-mono">{s.subdomain}</span>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-foreground">Services détectés ({asset.services.length})</h3>

        {asset.services.map((svc: any, svcIdx: number) => (
          <div key={`${svc.port}-${svc.protocol}`} className="rounded-xl border border-border bg-card overflow-hidden">

            {/* En-tête du service */}
            <div className="flex items-center gap-3 flex-wrap px-5 py-4 bg-muted/50">
              <span className="text-muted-foreground">{serviceIcon(svc.service)}</span>
              <span className="text-base font-mono font-bold px-2.5 py-1 rounded-lg bg-secondary border border-border">
                {svc.port}/{svc.protocol}
              </span>
              <span className="text-base font-semibold text-foreground">
                {svc.product || svc.service || "—"}
                {svc.version && <span className="text-muted-foreground font-normal ml-2">{svc.version}</span>}
              </span>
            </div>

            {/* Contenu du service — séparé par des lignes dashed */}
            <div className="px-5 py-4">

              {svc.banner && (
                <p className="text-sm text-muted-foreground font-mono mb-3">{svc.banner}</p>
              )}

              {/* HTTP */}
              {svc.http && svc.http.statusCode && (
                <>
                  <div className="flex items-start gap-3 mb-3">
                    {svc.http.faviconUrl && (
                      <img src={svc.http.faviconUrl} alt="" className="w-5 h-5 rounded shrink-0 mt-0.5" onError={(e) => { e.currentTarget.style.display = "none" }} />
                    )}
                    <div className="min-w-0">
                      {svc.http.title && <p className="text-base font-medium text-foreground">{svc.http.title}</p>}
                      {svc.http.metaDescription && <p className="text-sm text-muted-foreground mt-0.5">{svc.http.metaDescription}</p>}
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {[
                          svc.http.statusCode && `statut ${svc.http.statusCode}`,
                          svc.http.server,
                          svc.http.poweredBy,
                        ].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>

                  {(svc.http.technologies?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {svc.http.technologies.map((tech: string) => (
                        <span key={tech} className="text-sm px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground">{tech}</span>
                      ))}
                    </div>
                  )}

                  {svc.http.isApi && (
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-3">
                      <Code2 className="h-4 w-4" /> Détecté comme API
                    </p>
                  )}

                  {(svc.http.loginPoints?.length ?? 0) > 0 && (
                    <>
                      <Dashed />
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2">
                        <KeyRound className="h-4 w-4 text-amber-600" /> Points d'authentification
                      </p>
                      {svc.http.loginPoints.map((lp: any, i: number) => (
                        <p key={i} className="text-sm font-mono text-foreground mb-1">
                          {lp.url} <span className="text-muted-foreground">— {lp.type}, {lp.confidence}</span>
                        </p>
                      ))}
                    </>
                  )}

                  {(svc.http.sensitiveFilesFound?.length ?? 0) > 0 && (
                    <>
                      <Dashed />
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="h-4 w-4" /> Fichiers sensibles exposés
                      </p>
                      {svc.http.sensitiveFilesFound.map((f: string) => (
                        <p key={f} className="text-sm font-mono text-foreground mb-1">{f}</p>
                      ))}
                    </>
                  )}

                  {svc.http.headers && Object.keys(svc.http.headers).length > 0 && (
                    <>
                      <Dashed />
                      <details className="group">
                        <summary className="text-sm font-medium text-muted-foreground cursor-pointer flex items-center gap-1.5 hover:text-foreground">
                          <Code2 className="h-4 w-4" /> En-têtes HTTP
                        </summary>
                        <pre className="text-sm font-mono bg-muted rounded-lg p-4 mt-3 overflow-x-auto whitespace-pre-wrap break-all">
{Object.entries(svc.http.headers).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n")}
                        </pre>
                      </details>
                    </>
                  )}

                  {svc.http.bodyPreview && (
                    <>
                      <Dashed />
                      <details className="group">
                        <summary className="text-sm font-medium text-muted-foreground cursor-pointer flex items-center gap-1.5 hover:text-foreground">
                          <Code2 className="h-4 w-4" /> Aperçu de la réponse
                        </summary>
                        <pre className="text-sm font-mono bg-muted rounded-lg p-4 mt-3 overflow-x-auto max-h-72 overflow-y-auto whitespace-pre-wrap break-all">
{svc.http.bodyPreview}
                        </pre>
                      </details>
                    </>
                  )}
                </>
              )}

              {/* TLS */}
              {svc.tls?.subject && (
                <>
                  <Dashed />
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-foreground">Certificat TLS</p>
                    {svc.tls.selfSigned && <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">Auto-signé</span>}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground font-mono">{svc.tls.subject}</p>
                    {svc.tls.issuer && <p className="text-muted-foreground">Émis par : {svc.tls.issuer}</p>}
                    {svc.tls.validTo && <p className="text-muted-foreground">Valide jusqu'au {new Date(svc.tls.validTo).toLocaleDateString("fr-FR")}</p>}
                    {(svc.tls.san?.length ?? 0) > 0 && <p className="text-muted-foreground">SAN : {svc.tls.san.join(", ")}</p>}
                  </div>
                </>
              )}

              {/* SNMP */}
              {svc.snmp?.sysDescr && (
                <>
                  <Dashed />
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-semibold text-foreground">SNMP</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground">{svc.snmp.sysDescr}</p>
                    {svc.snmp.sysName && <p className="text-muted-foreground">Nom : {svc.snmp.sysName}</p>}
                    {svc.snmp.enterpriseName && <p className="text-muted-foreground">Fabricant : {svc.snmp.enterpriseName}</p>}
                    {svc.snmp.communityUsed && <p className="text-muted-foreground font-mono">Communauté : {svc.snmp.communityUsed}</p>}
                  </div>
                </>
              )}

              {/* FTP */}
              {svc.ftp && svc.ftp.anonymousLoginAllowed !== null && (
                <>
                  <Dashed />
                  <p className="text-sm">
                    {svc.ftp.anonymousLoginAllowed
                      ? <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Accès FTP anonyme autorisé</span>
                      : <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-600" /> Accès FTP anonyme refusé</span>
                    }
                  </p>
                </>
              )}

              {/* DevOps tool */}
              {svc.devopsTool?.toolType && (
                <>
                  <Dashed />
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    Outil exposé : {svc.devopsTool.toolType}
                    {svc.devopsTool.authRequired === false && " (sans authentification)"}
                  </p>
                </>
              )}

              {/* CVE */}
              {(svc.cves?.length ?? 0) > 0 && (
                <>
                  <Dashed />
                  <p className="text-sm font-semibold text-foreground mb-3">Vulnérabilités ({svc.cves.length})</p>
                  <CveList cves={svc.cves} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}