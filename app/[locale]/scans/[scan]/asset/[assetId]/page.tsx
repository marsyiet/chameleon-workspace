"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Monitor, Globe, Database, Lock, Plug, TerminalIcon, MapPin, Server, Clock } from "lucide-react"
import { useAsset } from "@/hooks/assets/use-asset"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import LoaderGlobal from "../../../_components/loader-global"
import { CveList } from "../../_components/cve-list"

const ASSET_TYPE_LABEL: Record<string, string> = {
  web: "Application web",
  database: "Base de données",
  api: "API",
  "remote-access": "Accès distant",
  mail: "Messagerie",
  authentication: "Authentification",
  network: "Équipement réseau",
  unknown: "Non classifié",
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
  informational: "Informationnel",
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-destructive bg-red-50/10",
  high: "text-destructive bg-red-50/10",
  medium: "text-amber-700 bg-amber-50/10",
  low: "text-green-700 bg-green-50/10",
  informational: "text-muted-foreground bg-muted",
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

  const allCves = asset.services.flatMap((svc) => svc.cves ?? [])
  const geo = asset.geo?.country
    ? [asset.geo.city, asset.geo.country].filter(Boolean).join(", ")
    : null

  return (
    <div className="w-full mx-auto space-y-6">

      {/* ── Retour ── */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux résultats
      </Button>

      {/* ── Header actif ── */}
      <div className="rounded-2xl border border-border bg-card px-6 py-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Monitor className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-foreground truncate">
              {asset.hostname || asset.ipAddress}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">{asset.ipAddress}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${SEVERITY_COLOR[asset.severity]}`}>
            {SEVERITY_LABEL[asset.severity]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <p className="text-sm font-medium text-foreground">{ASSET_TYPE_LABEL[asset.assetType]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Exposition</p>
            <p className="text-sm font-medium text-foreground capitalize">{asset.exposure}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Score de risque</p>
            <p className="text-sm font-medium text-foreground">{asset.riskScore.value.toFixed(1)} / 10</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Système</p>
            <p className="text-sm font-medium text-foreground">{asset.os ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Localisation ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h5 className="text-foreground">Localisation</h5>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="text-foreground">{geo ?? "Non géolocalisé"}</p>
            {asset.asn?.org && (
              <p className="text-muted-foreground">{asset.asn.asn} · {asset.asn.org}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Attribution ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <h5 className="text-foreground">Attribution</h5>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="text-foreground">
              {asset.attribution.guessedOrganizationName ?? "Non attribué"}
            </p>
            <p className="text-muted-foreground capitalize">
              Confiance : {asset.attribution.confidence}
            </p>
          </CardContent>
        </Card>

        {/* ── Suivi ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h5 className="text-foreground">Suivi</h5>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="text-muted-foreground">
              Première détection : {new Date(asset.firstSeenAt).toLocaleDateString("fr-FR")}
            </p>
            <p className="text-muted-foreground">
              Dernière vue : {new Date(asset.lastSeenAt).toLocaleDateString("fr-FR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Services détectés (une card par port/service, façon Censys) ── */}
      <div className="space-y-4">
        <h5 className="text-foreground">Services détectés</h5>

        {asset.services.map((svc) => {
          const isHttp = svc.service === "http" || svc.service === "https" || svc.port === 80 || svc.port === 443 || svc.port === 8080 || svc.port === 8443
          const isHttps = svc.service === "https" || svc.port === 443 || svc.port === 8443

          return (
            <Card key={svc.port}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-1 rounded-full bg-secondary border border-border">
                      {svc.port}/{svc.protocol}
                    </span>
                    <h5 className="text-foreground">
                      {svc.product || svc.service || "Service non identifié"}
                      {svc.version && (
                        <span className="text-muted-foreground font-normal ml-1.5">{svc.version}</span>
                      )}
                    </h5>
                  </div>
                  {svc.cves.length > 0 && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50/10 text-destructive">
                      {svc.cves.length} CVE
                    </span>
                  )}
                </div>
                {svc.banner && (
                  <p className="text-xs text-muted-foreground font-mono mt-1">{svc.banner}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Détails HTTP, uniquement pour les endpoints web de CE service */}
                {isHttp && asset.http && (asset.http.title || asset.http.statusCode) && (
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Endpoint HTTP</p>
                    <div className="flex items-start gap-2">
                      {asset.http.faviconUrl && (
                        <img
                          src={asset.http.faviconUrl}
                          alt=""
                          className="w-6 h-6 rounded shrink-0 mt-0.5"
                          onError={(e) => { e.currentTarget.style.display = "none" }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {asset.http.title || "Titre non détecté"}
                        </p>
                        {asset.http.statusCode && (
                          <p className="text-xs text-muted-foreground">
                            Statut {asset.http.statusCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {(asset.http.technologies?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {asset.http.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {(asset.http.loginPoints?.length ?? 0) > 0 && (
                      <div className="pt-1 space-y-1">
                        <p className="text-xs text-muted-foreground">Points d'authentification</p>
                        {asset.http.loginPoints.map((lp) => (
                          <p key={lp.url} className="text-xs font-mono text-foreground truncate">
                            {lp.url}
                            <span className="text-muted-foreground ml-2">
                              ({lp.type}, {lp.confidence})
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Certificat TLS, uniquement pour les endpoints HTTPS de CE service */}
                {isHttps && asset.tls && asset.tls.subject && (
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">Certificat TLS</p>
                      <div className="flex gap-1">
                        {asset.tls.selfSigned && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50/10 text-amber-700">
                            Auto-signé
                          </span>
                        )}
                        {asset.tls.expired && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50/10 text-destructive">
                            Expiré
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-foreground font-mono truncate">{asset.tls.subject}</p>
                      <p className="text-muted-foreground">
                        Émis par : {asset.tls.issuer || "—"}
                      </p>
                      {asset.tls.validTo && (
                        <p className="text-muted-foreground">
                          Valide jusqu'au {new Date(asset.tls.validTo).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      {asset.tls.san?.length > 0 && (
                        <p className="text-muted-foreground">
                          Noms alternatifs : {asset.tls.san.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* CVE de ce service précis */}
                {svc.cves.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Vulnérabilités</p>
                    <CveList cves={svc.cves} />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Vulnérabilités ── */}
      {allCves.length > 0 && (
        <Card>
          <CardHeader>
            <h5 className="text-foreground">Vulnérabilités</h5>
          </CardHeader>
          <CardContent>
            <CveList cves={allCves} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}