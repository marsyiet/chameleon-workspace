"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  ArrowLeft, Building2, MapPin, Globe, Server, Network,
  ShieldAlert, Clock, CircleCheckIcon, LoaderIcon,
  Clock3Icon, XCircleIcon, Layers,
} from "lucide-react"
import Link from "next/link"

import {
  useOrganizations,
  useOrganizationAssets,
  useOrganizationScans,
  useOrganizationStats,
  useOrganization,
} from "@/hooks/organizations/organizations-hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Réutilise le composant de fiche actif déjà existant pour l'inventaire —
// ajuster le chemin d'import selon son emplacement réel dans le projet.
import LoaderGlobal from "../../scans/_components/loader-global"
import { AssetCard } from "../../scans/inventory/_components/asset-card"

/* ── Composants utilitaires (mêmes conventions que la page de détail d'actif) ── */

function Dashed() {
  return <div className="border-t-2 border-dashed border-border my-4" />
}

function HoverBar({ colorClass = "bg-primary" }: { colorClass?: string }) {
  return (
    <div className="absolute bottom-0 left-0 h-0.5 w-full bg-border overflow-hidden">
      <div
        className={cn(
          "h-full w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100",
          colorClass
        )}
      />
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

function Field({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === "") return null
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right break-all">{value}</span>
    </div>
  )
}

function ScanStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline">
          <CircleCheckIcon className="size-3.5 fill-green-500 text-white" />
          Terminé
        </Badge>
      )
    case "running":
      return (
        <Badge variant="outline">
          <LoaderIcon className="size-3.5 animate-spin" />
          En cours
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="outline">
          <XCircleIcon className="size-3.5 text-destructive" />
          Échoué
        </Badge>
      )
    default:
      return (
        <Badge variant="outline">
          <Clock3Icon className="size-3.5" />
          En attente
        </Badge>
      )
  }
}

/* ── Mini-carte Leaflet (même logique que LocationCard de la page actif) ── */
function LocationCard({ geo }: { geo: { city?: string | null; lat?: number | null; lon?: number | null } }) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const hasGeo = geo?.lat != null && geo?.lon != null

  useEffect(() => {
    if (!hasGeo || !mapDivRef.current || mapRef.current) return
    const isDark = document.documentElement.classList.contains("dark")
    const coords: [number, number] = [geo.lat as number, geo.lon as number]
    const map = L.map(mapDivRef.current, {
      center: coords, zoom: 10, zoomControl: false, dragging: false,
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
  }, [hasGeo, geo?.lat, geo?.lon])

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
        <p className="text-sm font-semibold text-foreground">{geo?.city || "Non géolocalisé"}</p>
      </div>
    </div>
  )
}

/* ── Page principale ─────────────────────────────────────────────────── */
export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.organization as string

  const { data: orgData, isLoading } = useOrganization(organizationId)
  const { data: assetsData } = useOrganizationAssets(organizationId)
  const { data: scansData } = useOrganizationScans(organizationId)
  const { data: statsData } = useOrganizationStats(organizationId)

  const organization = orgData?.data
  const assets = assetsData?.data ?? []
  const scans = scansData?.data ?? []
  const stats = statsData?.data

  if (isLoading) return <div className="w-full h-full flex items-center justify-center"><LoaderGlobal /></div>
  if (!organization) return <div className="p-8 text-muted-foreground">Organisation introuvable</div>

  const perimeter = organization.declaredPerimeter ?? {}

  return (
    <div className="w-full mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux organisations
      </Button>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-6 transition-colors duration-200 hover:bg-secondary/50">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-medium">{organization.name}</h2>
              <Badge variant={organization.status === "active" ? "default" : "secondary"} className="capitalize">
                {organization.status}
              </Badge>
            </div>
            {organization.description && (
              <p className="text-sm text-muted-foreground">{organization.description}</p>
            )}
            {organization.sector && (
              <Badge variant="outline" className="capitalize">{organization.sector}</Badge>
            )}
          </div>
          <LocationCard geo={organization.geo} />
        </div>
        <Dashed />
        {/* Stats clés */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Actifs rattachés</p>
            <p className="text-2xl font-bold text-foreground">{stats?.assetsCount ?? assets.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Actifs critiques</p>
            <p className={cn("text-2xl font-bold", (stats?.criticalAssetsCount ?? 0) > 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
              {stats?.criticalAssetsCount ?? 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Scans effectués</p>
            <p className="text-2xl font-bold text-foreground">{stats?.scansCount ?? scans.length}</p>
          </div>
        </div>
        <HoverBar />
      </div>

      {/* ═══════════════════ PÉRIMÈTRE DÉCLARÉ ═══════════════════ */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:bg-secondary/50">
        <SectionTitle icon={Globe} title="Périmètre déclaré" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Domaines ({perimeter.domains?.length ?? 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(perimeter.domains ?? []).map((d: string) => (
                  <span key={d} className="text-sm px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground font-mono">{d}</span>
                ))}
                {(!perimeter.domains || perimeter.domains.length === 0) && (
                  <span className="text-sm text-muted-foreground">Aucun domaine déclaré</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Plages internes ({perimeter.internalRanges?.length ?? 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(perimeter.internalRanges ?? []).map((r: string) => (
                  <span key={r} className="text-sm px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground font-mono">{r}</span>
                ))}
                {(!perimeter.internalRanges || perimeter.internalRanges.length === 0) && (
                  <span className="text-sm text-muted-foreground">Aucune plage déclarée</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Prestataires ({perimeter.providers?.length ?? 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(perimeter.providers ?? []).map((p: string) => (
                  <span key={p} className="text-sm px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground">{p}</span>
                ))}
                {(!perimeter.providers || perimeter.providers.length === 0) && (
                  <span className="text-sm text-muted-foreground">Aucun prestataire déclaré</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Applications critiques ({perimeter.apps?.length ?? 0})
              </p>
              <div className="space-y-1.5">
                {(perimeter.apps ?? []).map((app: any) => (
                  <div key={app.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{app.name}</span>
                    {app.criticality && (
                      <Badge variant="outline" className="text-xs">{app.criticality}</Badge>
                    )}
                  </div>
                ))}
                {(!perimeter.apps || perimeter.apps.length === 0) && (
                  <span className="text-sm text-muted-foreground">Aucune application déclarée</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <HoverBar colorClass="bg-amber-500" />
      </div>

      {/* ═══════════════════ SCANS ═══════════════════ */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:bg-secondary/50">
        <SectionTitle icon={Layers} title={`Scans (${scans.length})`} />
        {scans.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun scan effectué pour cette organisation.</p>
        ) : (
          <div className="space-y-2">
            {scans.map((scan: any) => (
              <Link
                key={scan._id}
                href={`/scans/${scan._id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{scan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {scan.assetsDiscovered} actif(s) découvert(s) · {new Date(scan.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <ScanStatusBadge status={scan.status} />
              </Link>
            ))}
          </div>
        )}
        <HoverBar />
      </div>

      {/* ═══════════════════ ACTIFS RATTACHÉS ═══════════════════ */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-foreground">Actifs rattachés ({assets.length})</h3>
        {assets.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <ShieldAlert className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun actif rattaché à cette organisation pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assets.map((asset: any) => (
              <AssetCard key={asset._id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}