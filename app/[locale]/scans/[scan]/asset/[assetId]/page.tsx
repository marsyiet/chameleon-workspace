"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  ArrowLeft, Globe, Database, Lock, Plug, TerminalIcon,
  MapPin, Server, Clock, Building2, Tag, Network, ShieldAlert,
  KeyRound, MessageSquare, FileText, Radio, Code2, Mail, Link2,
} from "lucide-react"
import { useAsset } from "@/hooks/assets/use-asset"
import { Button } from "@/components/ui/button"
import LoaderGlobal from "../../../_components/loader-global"
import { CveList } from "../../_components/cve-list"
import { NATURE_LABEL, NATURE_ICON, formatNatureTag } from "@/app/[locale]/scans/_constants/nature-types"
import { cn } from "@/lib/utils"

const SEVERITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400", label: "Critique" },
  high: { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", label: "Élevé" },
  medium: { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", label: "Moyen" },
  low: { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", label: "Faible" },
  informational: { bg: "bg-muted", text: "text-muted-foreground", label: "Informationnel" },
}

const NATURE_TAG_STYLE = "bg-[oklch(0.70_0.17_45_/_0.16)] text-[oklch(0.42_0.15_45)] dark:bg-[oklch(0.70_0.17_45_/_0.22)] dark:text-[oklch(0.82_0.15_45)]"

const SECTION = {
  teal: "bg-[oklch(0.60_0.14_180_/_0.10)] dark:bg-[oklch(0.60_0.14_180_/_0.16)] text-[oklch(0.60_0.14_180)] dark:text-[oklch(0.85_0.13_180)]",
  amber: "bg-[oklch(0.68_0.16_70_/_0.10)] dark:bg-[oklch(0.68_0.16_70_/_0.16)] text-[oklch(0.68_0.16_70)] dark:text-[oklch(0.85_0.15_70)]",
  rose: "bg-[oklch(0.62_0.21_10_/_0.10)] dark:bg-[oklch(0.62_0.21_10_/_0.16)] text-[oklch(0.62_0.21_10)] dark:text-[oklch(0.85_0.16_10)]",
  violet: "bg-[oklch(0.58_0.26_290_/_0.10)] dark:bg-[oklch(0.58_0.26_290_/_0.16)] text-[oklch(0.58_0.26_290)] dark:text-[oklch(0.80_0.20_290)]",
  green: "bg-[oklch(0.62_0.16_150_/_0.10)] dark:bg-[oklch(0.62_0.16_150_/_0.16)] text-[oklch(0.55_0.15_150)] dark:text-[oklch(0.80_0.15_150)]",
}

function SectionHeader({ icon: Icon, title, tone }: { icon: any; title: string; tone: keyof typeof SECTION }) {
  return (
    <div className={cn("flex items-center gap-2 px-5 py-3", SECTION[tone])}>
      <Icon className="h-4 w-4" />
      <h5 className="text-foreground">{title}</h5>
    </div>
  )
}

// Ligne libellé/valeur avec un vrai texte humain — n'apparaît QUE si la
// donnée existe, pour ne jamais afficher un champ vide ou un nom technique.
function Field({ label, value, mono = false }: { label: string; value: any; mono?: boolean }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return null
  }
  const display = Array.isArray(value) ? value.join(", ") : String(value)
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-xs text-foreground text-right break-all", mono && "font-mono")}>{display}</span>
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
  }
  return map[service ?? ""] ?? <Plug className="w-4 h-4" />
}

// Vraie mini-carte Leaflet, tuiles monochromes cohérentes avec le reste de
// l'app (cf. geo-map-card) — un point unique, non interactive (juste un
// aperçu visuel de la position réelle).
function LocationCard({ asset }: { asset: any }) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const hasGeo = asset.geo?.lat != null && asset.geo?.lon != null

  useEffect(() => {
    if (!hasGeo || !mapDivRef.current || mapRef.current) return

    const isDark = document.documentElement.classList.contains("dark")
    const coords: [number, number] = [asset.geo.lat, asset.geo.lon]

    const map = L.map(mapDivRef.current, {
      center: coords,
      zoom: 9,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      attributionControl: false,
    })

    L.tileLayer(
      isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map)

    L.circleMarker(coords, {
      radius: 8,
      color: "#fff",
      weight: 2,
      fillColor: "oklch(0.60 0.14 180)" as any,
      fillOpacity: 1,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [hasGeo, asset.geo?.lat, asset.geo?.lon])

  return (
    <div className="relative w-full sm:w-56 shrink-0 rounded-xl overflow-hidden border border-border">
      {hasGeo ? (
        <div ref={mapDivRef} className="h-24 w-full" />
      ) : (
        <div className="h-24 w-full flex items-center justify-center bg-muted">
          <MapPin className="h-5 w-5 text-muted-foreground/40" />
        </div>
      )}
      <div className="bg-card px-3 py-2.5 space-y-0.5">
        {hasGeo ? (
          <>
            <p className="text-sm font-semibold text-foreground truncate">
              {[asset.geo.city, asset.geo.country].filter(Boolean).join(", ") || "Localisation inconnue"}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
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

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.assetId as string

  const { data: asset, isLoading } = useAsset(assetId)

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoaderGlobal />
      </div>
    )
  }

  if (!asset) return <div>Actif introuvable</div>

  const allCves = asset.services.flatMap((svc: any) => svc.cves ?? [])
  const severity = SEVERITY_STYLE[asset.severity] ?? SEVERITY_STYLE.informational
  const natureType = asset.natureType ?? "unknown"
  const NatureIcon = NATURE_ICON[natureType] ?? Server
  const natureLabel = NATURE_LABEL[natureType] ?? NATURE_LABEL.unknown
  const secondaryTags = (asset.natureTags ?? []).filter(
    (t: string) => t !== natureType.replace(/_/g, "-")
  )

  const hasDns = asset.dns && (asset.dns.a?.length || asset.dns.aaaa?.length || asset.dns.mx?.length || asset.dns.ns?.length || asset.dns.txt?.length)
  const hasSubdomains = (asset.subdomainsDiscovered?.length ?? 0) > 0
  const hasWhois = asset.whois?.ipNetwork?.name || asset.whois?.domain?.registrar
  const hasThreatIntel = asset.threatIntel?.mispMatch || asset.threatIntel?.typosquatCandidateOf || (asset.threatIntel?.reputationFlags?.length ?? 0) > 0

  return (
    <div className="w-full mx-auto space-y-6">

      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux résultats
      </Button>

      {/* ── Header ── */}
      <div className="rounded-2xl border border-border bg-card px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.58_0.26_290_/_0.12)] dark:bg-[oklch(0.58_0.26_290_/_0.20)]">
                <Server className="h-5 w-5 text-[oklch(0.58_0.26_290)] dark:text-[oklch(0.80_0.20_290)]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-foreground truncate">{asset.hostname || asset.ipAddress}</h3>
                {asset.hostname && <p className="text-sm text-muted-foreground font-mono">{asset.ipAddress}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold", NATURE_TAG_STYLE)}>
                <NatureIcon className="h-4 w-4" />
                {natureLabel}
              </span>
              {secondaryTags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium bg-[oklch(0.58_0.26_290_/_0.10)] text-[oklch(0.42_0.20_290)] dark:bg-[oklch(0.58_0.26_290_/_0.18)] dark:text-[oklch(0.78_0.18_290)]">
                  <Tag className="h-3 w-3" />
                  {formatNatureTag(tag)}
                </span>
              ))}
              <span className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", severity.bg, severity.text)}>
                {severity.label}
              </span>
            </div>

            {(asset.tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {asset.tags.map((t: string) => (
                  <span key={t} className="text-[11px] px-2 py-0.5 rounded-lg bg-secondary text-secondary-foreground font-mono">{t}</span>
                ))}
              </div>
            )}
          </div>

          <LocationCard asset={asset} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Score de risque</p>
            <p className={cn("text-lg font-bold", severity.text)}>
              {asset.riskScore.value.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Exposition</p>
            <p className="text-sm font-semibold text-foreground capitalize">{asset.exposure}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Services</p>
            <p className="text-sm font-semibold text-foreground">{asset.services.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Système</p>
            <p className="text-sm font-semibold text-foreground truncate">{asset.os ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Attribution ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Building2} title="Attribution" tone="amber" />
          <div className="px-5 py-4 space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              {asset.attribution?.guessedOrganizationName ?? "Non attribué"}
            </p>
            {asset.attribution?.confidence && (
              <p className="text-sm text-muted-foreground capitalize">Confiance : {asset.attribution.confidence}</p>
            )}
            {(asset.attribution?.signals?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {asset.attribution.signals.map((s: string) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-mono">{s}</span>
                ))}
              </div>
            )}
            {asset.asn?.org && (
              <p className="text-xs text-muted-foreground pt-1">{asset.asn.asn} · {asset.asn.org}</p>
            )}
            {asset.bgp?.prefix && (
              <p className="text-xs text-muted-foreground">Préfixe annoncé : {asset.bgp.prefix} ({asset.bgp.asn_name})</p>
            )}
          </div>
        </div>

        {/* ── Suivi ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Clock} title="Suivi" tone="rose" />
          <div className="px-5 py-4 space-y-1.5 text-sm">
            <p className="text-muted-foreground">
              Première détection : <span className="text-foreground font-medium">{new Date(asset.firstSeenAt).toLocaleDateString("fr-FR")}</span>
            </p>
            <p className="text-muted-foreground">
              Dernière vue : <span className="text-foreground font-medium">{new Date(asset.lastSeenAt).toLocaleDateString("fr-FR")}</span>
            </p>
          </div>
        </div>

        {/* ── WHOIS ── */}
        {hasWhois && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <SectionHeader icon={FileText} title="WHOIS" tone="teal" />
            <div className="px-5 py-4 space-y-1.5 text-sm">
              {asset.whois?.ipNetwork?.name && (
                <p className="text-muted-foreground">
                  Bloc IP : <span className="text-foreground font-medium">{asset.whois.ipNetwork.name}</span>
                  {asset.whois.ipNetwork.country && ` (${asset.whois.ipNetwork.country})`}
                </p>
              )}
              {asset.whois?.domain?.registrar && (
                <p className="text-muted-foreground">
                  Registrar : <span className="text-foreground font-medium">{asset.whois.domain.registrar}</span>
                </p>
              )}
              {asset.whois?.domain?.expiresAt && (
                <p className="text-muted-foreground">
                  Expire le : <span className="text-foreground font-medium">{new Date(asset.whois.domain.expiresAt).toLocaleDateString("fr-FR")}</span>
                </p>
              )}
              {(asset.whois?.domain?.nameservers?.length ?? 0) > 0 && (
                <p className="text-muted-foreground">
                  Nameservers : <span className="text-foreground font-mono text-xs">{asset.whois.domain.nameservers.join(", ")}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Threat Intel ── */}
        {hasThreatIntel && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <SectionHeader icon={ShieldAlert} title="Renseignement sur la menace" tone="rose" />
            <div className="px-5 py-4 space-y-1.5 text-sm">
              {asset.threatIntel.mispMatch && (
                <p className="text-destructive font-medium">Correspondance MISP détectée{asset.threatIntel.mispEventId && ` (événement ${asset.threatIntel.mispEventId})`}</p>
              )}
              {asset.threatIntel.typosquatCandidateOf && (
                <p className="text-destructive font-medium">Candidat typosquatting de : {asset.threatIntel.typosquatCandidateOf}</p>
              )}
              {(asset.threatIntel.reputationFlags?.length ?? 0) > 0 && (
                <p className="text-muted-foreground">{asset.threatIntel.reputationFlags.join(", ")}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DNS ── */}
      {hasDns && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Network} title="Enregistrements DNS" tone="teal" />
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-sm">
            <div className="divide-y divide-border/50">
              <Field label="Adresses IPv4 (A)" value={asset.dns.a} mono />
              <Field label="Adresses IPv6 (AAAA)" value={asset.dns.aaaa} mono />
              <Field label="Serveurs mail (MX)" value={asset.dns.mx} mono />
              <Field label="Serveurs de noms (NS)" value={asset.dns.ns} mono />
            </div>
            <div className="divide-y divide-border/50">
              <Field label="Enregistrements TXT" value={asset.dns.txt} mono />
              {asset.dns.spfValid !== null && asset.dns.spfValid !== undefined && (
                <Field label="SPF" value={asset.dns.spfValid ? "Valide" : "Absent"} />
              )}
              {asset.dns.dmarcPresent !== null && asset.dns.dmarcPresent !== undefined && (
                <Field label="DMARC" value={asset.dns.dmarcPresent ? "Présent" : "Absent"} />
              )}
              {asset.dns.zoneTransferVulnerable !== null && asset.dns.zoneTransferVulnerable !== undefined && (
                <Field label="Transfert de zone" value={asset.dns.zoneTransferVulnerable ? "Vulnérable (AXFR accepté)" : "Non vulnérable"} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sous-domaines ── */}
      {hasSubdomains && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Globe} title={`Sous-domaines découverts (${asset.subdomainsDiscovered.length})`} tone="violet" />
          <div className="px-5 py-4 flex flex-wrap gap-1.5">
            {asset.subdomainsDiscovered.map((s: any) => (
              <span key={s.subdomain} className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground font-mono">
                {s.subdomain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Services détectés ── */}
      <div className="space-y-4">
        <h5 className="text-foreground px-1">Services détectés ({asset.services.length})</h5>

        {asset.services.map((svc: any) => {
          const svcNature = svc.natureType ?? "unknown"
          const SvcNatureIcon = NATURE_ICON[svcNature] ?? Server

          return (
            <div key={svc.port} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-3 flex-wrap px-5 py-3 bg-muted/60">
                <span className="text-muted-foreground">{serviceIcon(svc.service)}</span>
                <span className="text-sm font-mono font-bold px-2 py-1 rounded-lg bg-secondary border border-border">
                  {svc.port}/{svc.protocol}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {svc.product || svc.service || "—"}
                  {svc.version && <span className="text-muted-foreground font-normal ml-1.5">{svc.version}</span>}
                </span>
                <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ml-auto", NATURE_TAG_STYLE)}>
                  <SvcNatureIcon className="h-3 w-3" />
                  {NATURE_LABEL[svcNature] ?? NATURE_LABEL.unknown}
                </span>
              </div>

              <div className="px-5 py-4 space-y-4">
                {svc.banner && (
                  <p className="text-xs text-muted-foreground font-mono">{svc.banner}</p>
                )}

                {/* HTTP */}
                {svc.http && (svc.http.title || svc.http.statusCode || svc.http.bodyPreview) && (
                  <div className="rounded-lg border border-[oklch(0.60_0.14_180_/_0.30)] overflow-hidden">
                    <div className="bg-[oklch(0.60_0.14_180_/_0.10)] dark:bg-[oklch(0.60_0.14_180_/_0.16)] px-3 py-2 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[oklch(0.60_0.14_180)] dark:text-[oklch(0.85_0.13_180)]" />
                      <p className="text-xs font-semibold text-foreground">Web</p>
                    </div>
                    <div className="px-3 py-3 space-y-3">
                      <div className="flex items-start gap-2">
                        {svc.http.faviconUrl && (
                          <img src={svc.http.faviconUrl} alt="" className="w-5 h-5 rounded shrink-0 mt-0.5" onError={(e) => { e.currentTarget.style.display = "none" }} />
                        )}
                        <div className="min-w-0">
                          {svc.http.title && <p className="text-sm font-medium text-foreground">{svc.http.title}</p>}
                          {svc.http.metaDescription && <p className="text-xs text-muted-foreground mt-0.5">{svc.http.metaDescription}</p>}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[
                              svc.http.statusCode && `statut ${svc.http.statusCode}`,
                              svc.http.server,
                              svc.http.poweredBy,
                            ].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>

                      {(svc.http.technologies?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {svc.http.technologies.map((tech: string) => (
                            <span key={tech} className="text-[11px] px-2 py-0.5 rounded-lg bg-secondary text-secondary-foreground">{tech}</span>
                          ))}
                        </div>
                      )}

                      {(svc.http.loginPoints?.length ?? 0) > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <KeyRound className="h-3 w-3" /> Points d'authentification
                          </p>
                          {svc.http.loginPoints.map((lp: any, i: number) => (
                            <p key={i} className="text-xs font-mono text-foreground truncate">
                              {lp.url} <span className="text-muted-foreground">({lp.type}, {lp.confidence})</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {(svc.http.contactForms?.length ?? 0) > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Formulaires de contact
                          </p>
                          {svc.http.contactForms.map((cf: any, i: number) => (
                            <p key={i} className="text-xs font-mono text-foreground truncate">
                              {cf.url} <span className="text-muted-foreground">({cf.fieldsDetected?.join(", ")})</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {(svc.http.redirectChain?.length ?? 0) > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Link2 className="h-3 w-3 shrink-0" /> {svc.http.redirectChain.join(" → ")}
                        </p>
                      )}

                      {svc.http.headers && Object.keys(svc.http.headers).length > 0 && (
                        <details className="group">
                          <summary className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center gap-1 hover:text-foreground">
                            <Code2 className="h-3 w-3" /> En-têtes HTTP
                          </summary>
                          <pre className="text-[11px] font-mono bg-muted rounded-lg p-3 mt-2 overflow-x-auto whitespace-pre-wrap break-all">
{Object.entries(svc.http.headers).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n")}
                          </pre>
                        </details>
                      )}

                      {svc.http.bodyPreview && (
                        <details className="group">
                          <summary className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center gap-1 hover:text-foreground">
                            <Code2 className="h-3 w-3" /> Aperçu de la réponse
                          </summary>
                          <pre className="text-[11px] font-mono bg-muted rounded-lg p-3 mt-2 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-all">
{svc.http.bodyPreview}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

                {/* TLS */}
                {svc.tls?.subject && (
                  <div className="rounded-lg border border-[oklch(0.62_0.16_150_/_0.30)] overflow-hidden">
                    <div className="bg-[oklch(0.62_0.16_150_/_0.10)] dark:bg-[oklch(0.62_0.16_150_/_0.16)] px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-[oklch(0.55_0.15_150)] dark:text-[oklch(0.80_0.15_150)]" />
                        <p className="text-xs font-semibold text-foreground">Certificat TLS</p>
                      </div>
                      <div className="flex gap-1">
                        {svc.tls.selfSigned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">Auto-signé</span>}
                        {svc.tls.expired && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-destructive">Expiré</span>}
                      </div>
                    </div>
                    <div className="px-3 py-3 space-y-1 text-xs">
                      <p className="text-foreground font-mono truncate">{svc.tls.subject}</p>
                      {svc.tls.issuer && <p className="text-muted-foreground">Émis par : {svc.tls.issuer}</p>}
                      {svc.tls.validTo && <p className="text-muted-foreground">Valide jusqu'au {new Date(svc.tls.validTo).toLocaleDateString("fr-FR")}</p>}
                      {(svc.tls.san?.length ?? 0) > 0 && <p className="text-muted-foreground">Noms alternatifs : {svc.tls.san.join(", ")}</p>}
                    </div>
                  </div>
                )}

                {/* SNMP */}
                {svc.snmp?.sysDescr && (
                  <div className="rounded-lg bg-secondary/50 px-3 py-2.5 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Radio className="h-3 w-3" /> SNMP
                    </p>
                    <p className="text-xs text-foreground">{svc.snmp.sysDescr}</p>
                    {svc.snmp.vendor && <p className="text-xs text-muted-foreground">Fabricant : {svc.snmp.vendor}</p>}
                  </div>
                )}

                {/* CVE du service */}
                {(svc.cves?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Vulnérabilités ({svc.cves.length})</p>
                    <CveList cves={svc.cves} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}