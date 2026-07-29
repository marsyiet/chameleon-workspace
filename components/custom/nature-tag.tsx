import { NATURE_ICON, NATURE_LABEL } from "@/app/[locale]/scans/_constants/nature-types"
import { cn } from "@/lib/utils"
import { Tag } from "lucide-react"

interface NatureTagProps {
  natureType: string
  size?: "default" | "lg"
  className?: string
}

// Orange chaud, complémentaire au violet signature de l'app — sert de seul
// accent de couleur sur les cards, pour que la nature d'un actif saute
// immédiatement aux yeux au lieu de se fondre dans le reste du texte.
export function NatureTag({ natureType, size = "default", className }: NatureTagProps) {
  const label = NATURE_LABEL[natureType] ?? NATURE_LABEL.unknown
  const Icon = NATURE_ICON[natureType] ?? NATURE_ICON.unknown

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide uppercase shrink-0",
        "bg-[oklch(0.70_0.17_45_/_0.16)] text-[oklch(0.42_0.15_45)]",
        "dark:bg-[oklch(0.70_0.17_45_/_0.20)] dark:text-[oklch(0.80_0.15_45)]",
        size === "lg"
          ? "px-3.5 py-1.5 text-sm gap-2"
          : "px-2.5 py-1 text-[11px]",
        className
      )}
    >
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
      {label}
    </span>
  )
}

// Petit chip secondaire pour les natureTags cumulatifs (technologies, rôles
// détectés en plus) — même famille de couleur, plus discret que le tag
// principal pour ne pas rivaliser avec lui visuellement.
export function NatureTagChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0",
        "bg-[oklch(0.70_0.17_45_/_0.10)] text-[oklch(0.48_0.14_45)]",
        "dark:bg-[oklch(0.70_0.17_45_/_0.14)] dark:text-[oklch(0.75_0.13_45)]",
        className
      )}
    >
      <Tag className="h-2.5 w-2.5" />
      {label}
    </span>
  )
}