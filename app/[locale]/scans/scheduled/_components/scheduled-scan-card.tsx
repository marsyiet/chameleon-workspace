"use client"

import { useState } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  CalendarClock, Network, Globe, Shield, ArrowUpRight,
  ChevronDown, Target, Clock, AlertCircle
} from "lucide-react"

import { ScheduledScan } from "@/hooks/scans/use-scheduled-scans"
import { cn } from "@/lib/utils"

/* ── Configuration des types de scan ────────────────────────────────── */

const SCAN_TYPE_CONFIG: Record<string, { label: string; icon: any; text: string; bar: string }> = {
  network: {
    label: "Réseau",
    icon: Network,
    text: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
  },
  web: {
    label: "Web",
    icon: Globe,
    text: "text-purple-600 dark:text-purple-400",
    bar: "bg-purple-500",
  },
  full: {
    label: "Complet",
    icon: Shield,
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  },
}

interface ScheduledScanCardProps {
  scan: ScheduledScan
  className?: string
  onSelect?: (scan: ScheduledScan) => void
}

export default function ScheduledScanCard({
  scan,
  className,
  onSelect,
}: ScheduledScanCardProps) {
  const [expanded, setExpanded] = useState(false)

  const scheduledDate = new Date(scan.scheduledAt)
  const config = SCAN_TYPE_CONFIG[scan.scanType] ?? {
    label: scan.scanType,
    icon: Shield,
    text: "text-muted-foreground",
    bar: "bg-primary",
  }
  const Icon = config.icon

  const targets = scan.targets ?? []
  const isOverdue = scheduledDate.getTime() < Date.now()

  return (
    <div
      className={cn(
        "group/card relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200",
        "hover:bg-secondary/30 hover:border-border/80 shadow-sm hover:shadow-md",
        className
      )}
    >
      {/* ── Entête / Titre cliquable ── */}
      <div
        onClick={() => onSelect?.(scan)}
        className={cn(
          "p-5 space-y-3 select-none",
          onSelect && "cursor-pointer"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 group-hover/card:text-primary transition-colors">
              <h4 className="font-mono text-foreground truncate leading-snug">
                {scan.name}
              </h4>
              {onSelect && (
                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover/card:opacity-100 transition-all text-muted-foreground shrink-0" />
              )}
            </div>
            {scan.description ? (
              <p className="text-sm font-sans text-muted-foreground line-clamp-2 mt-0.5">
                {scan.description}
              </p>
            ) : (
              <p className="text-sm font-sans text-muted-foreground italic mt-0.5">
                Aucune description
              </p>
            )}
          </div>
        </div>

        {/* Badges de Cibles */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-medium bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/20">
            <Target className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
            {targets.length} Cible{targets.length > 1 ? "s" : ""}
          </span>

          {targets.slice(0, 2).map((target: any, i: number) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-mono font-medium bg-muted text-muted-foreground max-w-[180px] truncate"
            >
              {target.target ?? target}
            </span>
          ))}

          {targets.length > 2 && (
            <span className="text-sm text-muted-foreground font-medium">
              +{targets.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* ── Section Métriques & Détails ── */}
      <div className="px-5 pb-4 space-y-4">
        {/* Grille de métriques avec Type à la place de Statut */}
        <div className="grid grid-cols-3 py-3 border-y-2 border-dashed border-border text-sm">
          <div className="pr-2">
            <p className="text-xs text-muted-foreground font-medium">Planifié pour</p>
            <p className="font-medium mt-0.5 text-sm text-foreground truncate">
              {format(scheduledDate, "dd/MM/yyyy")}
            </p>
          </div>

          <div className="px-3 border-x-2 border-dashed border-border">
            <p className="text-xs text-muted-foreground font-medium">Heure</p>
            <p className="font-medium text-foreground mt-0.5 text-sm">
              {format(scheduledDate, "HH:mm")}
            </p>
          </div>

          <div className="pl-3">
            <p className="text-xs text-muted-foreground font-medium">Type</p>
            <p className={cn("font-medium mt-0.5 text-sm truncate flex items-center gap-1.5", config.text)}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {config.label}
            </p>
          </div>
        </div>

        {/* Info complémentaire d'exécution relative */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="capitalize">
            {formatDistanceToNow(scheduledDate, { addSuffix: true, locale: fr })}
          </span>
        </div>

        {/* Bouton de l'Accordéon avec bordure pointillée */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          className="w-full flex items-center justify-between text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors pt-3 border-t-2 border-dashed border-border"
        >
          <span>Détails de la planification</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
        </button>

        {/* Contenu Déroulant */}
        {expanded && (
          <div className="space-y-3 pt-1 text-sm">
            {targets.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  Toutes les cibles
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {targets.map((target: any, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground border border-border"
                    >
                      {target.target ?? target}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isOverdue && (
              <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> La date prévue est dépassée (en attente du worker)
              </p>
            )}

            <div className="flex items-center gap-2 text-muted-foreground pt-1">
              <Clock className="h-4 w-4" />
              Créé le : {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString("fr-FR") : "Non spécifié"}
            </div>

            {onSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(scan)
                }}
                className="w-full text-center font-semibold text-sm text-primary hover:underline pt-3 border-t-2 border-dashed border-border flex items-center justify-center gap-1.5"
              >
                Gérer ce scan <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Barre animée inférieure ── */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-border/40 overflow-hidden">
        <div
          className={cn(
            "h-full w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover/card:scale-x-100",
            config.bar
          )}
        />
      </div>
    </div>
  )
}