"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  /** Valeur entre 0 et 100 */
  value: number
  /** Largeur fixe de chaque barre en px (défaut 4) */
  barWidth?: number
  /** Gap entre barres en px (défaut 3) */
  gap?: number
  /** Hauteur du composant (classe Tailwind, défaut "h-5") */
  height?: string
  /** Couleur des barres remplies. Accepte oklch, hex, css var... */
  color?: string
  /** Gradient sur les barres remplies : [from, to] */
  gradient?: [string, string]
  /** Afficher le pourcentage à droite */
  showLabel?: boolean
  /** Arrondi des barres (défaut "rounded-sm") */
  rounded?: string
  /** Opacité des barres vides (0-1, défaut 0.25) */
  emptyOpacity?: number
  /** Classe CSS additionnelle sur le container */
  className?: string
  /** Callback quand la valeur change visuellement */
  onSegmentsChange?: (segments: number) => void
}

function lerpHex(a: string, b: string, t: number): string {
  // Interpolation simple entre deux oklch passés en string
  // On délègue à la fonction gradient si fourni
  return t < 0.5 ? a : b
}

function interpolateGradient(from: string, to: string, t: number): string {
  // Extrait les valeurs oklch si possible, sinon fallback sur from/to
  const oklchRe = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/
  const mF = from.match(oklchRe)
  const mT = to.match(oklchRe)
  if (mF && mT) {
    const L = parseFloat(mF[1]) + t * (parseFloat(mT[1]) - parseFloat(mF[1]))
    const C = parseFloat(mF[2]) + t * (parseFloat(mT[2]) - parseFloat(mF[2]))
    // hue shortpath
    let hF = parseFloat(mF[3])
    let hT = parseFloat(mT[3])
    let dH = hT - hF
    if (dH > 180)  dH -= 360
    if (dH < -180) dH += 360
    const H = hF + t * dH
    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${((H % 360) + 360) % 360})`
  }
  return t < 0.5 ? from : to
}

export function ProgressBar({
  value,
  barWidth = 4,
  gap = 3,
  height = "h-5",
  color = "oklch(0.58 0.26 290)",
  gradient,
  showLabel = false,
  rounded = "rounded-sm",
  emptyOpacity = 0.25,
  className,
  onSegmentsChange,
}: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [segments, setSegments] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w === 0) return
      const n = Math.floor(w / (barWidth + gap))
      setSegments(n)
      onSegmentsChange?.(n)
    })
    ro.observe(el)
    // Fallback si le ResizeObserver fire trop tôt
    const w = el.getBoundingClientRect().width
    if (w > 0) {
      setSegments(Math.floor(w / (barWidth + gap)))
    }
    return () => ro.disconnect()
  }, [barWidth, gap, onSegmentsChange])

  const filled = Math.round((value / 100) * segments)

  function getColor(i: number): string {
    if (!gradient) return color
    const t = filled > 1 ? i / (filled - 1) : 0
    return interpolateGradient(gradient[0], gradient[1], t)
  }

  return (
    <div className={cn("flex items-center gap-2 w-full min-w-16", className)}>
      <div
        ref={ref}
        className={cn("flex flex-1", height)}
        style={{ gap }}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn("h-full shrink-0 transition-colors duration-300", rounded)}
            style={{
              width: barWidth,
              height: "20",
              background: i < filled ? getColor(i) : color,
              opacity: i < filled ? 1 : emptyOpacity,
            }}
          />
        ))}
      </div>

      {showLabel && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground w-8 text-right">
          {value}%
        </span>
      )}
    </div>
  )
}