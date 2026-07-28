"use client"

import { cn } from "@/lib/utils"

export type MetricAccent = "violet" | "teal" | "amber" | "rose"

const ACCENT_STYLES: Record<MetricAccent, { icon: string; bar: string }> = {
  violet: {
    icon: "text-[oklch(0.58_0.26_290)]",
    bar: "bg-[oklch(0.58_0.26_290)]",
  },
  teal: {
    icon: "text-[oklch(0.60_0.14_180)]",
    bar: "bg-[oklch(0.60_0.14_180)]",
  },
  amber: {
    icon: "text-[oklch(0.68_0.16_70)]",
    bar: "bg-[oklch(0.68_0.16_70)]",
  },
  rose: {
    icon: "text-[oklch(0.62_0.21_10)]",
    bar: "bg-[oklch(0.62_0.21_10)]",
  },
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  isLoading?: boolean
  accent?: MetricAccent
}

export function MetricCard({ icon: Icon, label, value, isLoading, accent = "violet" }: MetricCardProps) {
  const styles = ACCENT_STYLES[accent]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card px-4 py-3 transition-colors duration-200",
        "hover:bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", styles.icon)} />
        <p className="text-xs font-medium text-foreground truncate">{label}</p>
      </div>

      {isLoading ? (
        <div className="mt-1.5 h-7 w-16 rounded bg-muted animate-pulse" />
      ) : (
        <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
          {value.toLocaleString("fr-FR")}
        </p>
      )}

      {/* Barre qui se remplit au hover */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-border overflow-hidden">
        <div
          className={cn(
            "h-full w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100",
            styles.bar
          )}
        />
      </div>
    </div>
  )
}