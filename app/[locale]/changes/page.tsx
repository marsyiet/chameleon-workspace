"use client"
import { useState } from "react"
import Link from "next/link"
import {
  PlusCircle, MinusCircle, ShieldAlert, TrendingUp, TrendingDown,
  Fingerprint, KeyRound, Lock, Server, ChevronLeft, ChevronRight,
} from "lucide-react"
import { useChanges } from "@/hooks/use-changes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import LoaderGlobal from "../scans/_components/loader-global"


const CHANGE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  service_appeared: { icon: PlusCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", label: "Nouveau service" },
  service_disappeared: { icon: MinusCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Service disparu" },
  new_vulnerability: { icon: ShieldAlert, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", label: "Nouvelle vulnérabilité" },
  severity_changed: { icon: TrendingUp, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", label: "Sévérité modifiée" },
  risk_score_changed: { icon: TrendingUp, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", label: "Score de risque modifié" },
  role_changed: { icon: Fingerprint, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", label: "Rôle reclassé" },
  new_authentication_surface: { icon: KeyRound, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", label: "Nouvelle authentification" },
  tls_issuer_changed: { icon: Lock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", label: "Certificat modifié" },
  tls_downgraded_self_signed: { icon: Lock, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", label: "Certificat dégradé" },
  asset_count_variation: { icon: Server, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", label: "Variation du périmètre" },
}

function ChangeIcon({ type }: { type: string }) {
  const config = CHANGE_CONFIG[type] ?? { icon: TrendingDown, color: "text-muted-foreground", bg: "bg-muted", label: type }
  const Icon = config.icon
  return (
    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", config.bg)}>
      <Icon className={cn("h-4.5 w-4.5", config.color)} />
    </div>
  )
}

function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "à l'instant"
  if (diffHours < 24) return `il y a ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `il y a ${diffDays} j`
  return date.toLocaleDateString("fr-FR")
}

export default function ChangesPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const { data, isLoading, error } = useChanges({ page, limit })

  const changes = data?.data?.changes ?? []
  const total = data?.data?.total ?? 0
  const pageCount = Math.ceil(total / limit)

  if (isLoading) return <LoaderGlobal />
  if (error) return <div className="p-8 text-muted-foreground">Erreur lors du chargement des changements.</div>

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium">Changements détectés</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} changement{total !== 1 ? "s" : ""} enregistré{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {changes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun changement détecté pour l'instant. Les changements apparaissent lorsqu'un actif déjà
            connu évolue entre deux scans.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {changes.map((change: any) => {
            const config = CHANGE_CONFIG[change.type]
            return (
              <div
                key={change._id}
                className="group relative flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:bg-secondary/50"
              >
                <ChangeIcon type={change.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-foreground">{change.summary}</span>
                    {config?.label && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground shrink-0">
                        {config.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    {change.ipAddress && (
                      <Link
                        href={`/scans/${change.scanId}/asset/${change.assetId}`}
                        className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {change.ipAddress}
                      </Link>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(change.detectedAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}