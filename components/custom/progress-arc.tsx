"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ProgressArcProps {
  /** Valeur entre 0 et 100 */
  value: number
  /** Largeur fixe de chaque barre en px (défaut 5) */
  barWidth?: number
  /** Gap entre barres en px (défaut 4) */
  gap?: number
  /** Couleur des barres remplies */
  color?: string
  /** Gradient sur les barres remplies : [from, to] */
  gradient?: [string, string]
  /** Afficher le score au centre */
  showScore?: boolean
  /** Label sous le score (ex: "/ 100") */
  scoreLabel?: string
  /** Afficher un glow sur les barres remplies */
  glow?: boolean
  /** Opacité des barres vides (0-1, défaut 0.3) */
  emptyOpacity?: number
  /** Épaisseur radiale des barres en % du rayon (défaut 0.10) */
  barLength?: number
  /** Classe CSS additionnelle sur le container */
  className?: string
  /** Rayon de l'arc en % de la largeur (défaut 0.40) */
  radius?: number
  /** Valeur minimale affichée en bas à gauche (défaut 0) */
  min?: number
  /** Valeur maximale affichée en bas à droite (défaut 100) */
  max?: number
}

function interpolateGradient(from: string, to: string, t: number): string {
  const oklchRe = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/
  const mF = from.match(oklchRe)
  const mT = to.match(oklchRe)
  if (mF && mT) {
    const L = parseFloat(mF[1]) + t * (parseFloat(mT[1]) - parseFloat(mF[1]))
    const C = parseFloat(mF[2]) + t * (parseFloat(mT[2]) - parseFloat(mF[2]))
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

export function ProgressArc({
  value,
  barWidth = 5,
  gap = 4,
  color = "oklch(0.58 0.26 290)",
  gradient,
  showScore = true,
  scoreLabel = "/ 100",
  glow = true,
  emptyOpacity = 0.3,
  barLength = 0.10,
  className,
  radius = 0.40,
  min = 0,
  max = 100,
}: ProgressArcProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cx  = size / 2
  const cy  = size * 0.62
  const r   = size * radius
  const bH  = size * barLength
  const bW  = barWidth

  const arcLen   = Math.PI * r
  const segments = size > 0 ? Math.max(4, Math.floor(arcLen / (bW + gap))) : 0
  const filled   = Math.round((value / 100) * segments)
  const svgH     = size * 0.75

  const glowId = `arc-glow-${Math.random().toString(36).slice(2, 7)}`

  function getColor(i: number): string {
    if (!gradient) return color
    const t = filled > 1 ? i / (filled - 1) : 0
    return interpolateGradient(gradient[0], gradient[1], t)
  }

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {size > 0 && (
        <svg width={size} height={svgH} viewBox={`${-size * 0.05} 0 ${size * 1.10} ${svgH}`}>
          {glow && (
            <defs>
              <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}

          {Array.from({ length: segments }).map((_, i) => {
            const rot      = 180 + (i / (segments - 1)) * 180
            const isFilled = i < filled
            const fill     = isFilled ? getColor(i) : color

            return (
              <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
                <rect
                  x={r - bH / 2}
                  y={-bW / 2}
                  width={bH}
                  height={bW}
                  rx={bW / 2}
                  fill={fill}
                  opacity={isFilled ? 1 : emptyOpacity}
                  filter={isFilled && glow ? `url(#${glowId})` : undefined}
                />
              </g>
            )
          })}

          {showScore && (
            <>
              {/* 0 en bas à gauche */}
              <text
                x={cx - r}
                y={cy + size * 0.10}
                textAnchor="middle"
                fontSize={size * 0.04}
                fill="var(--muted-foreground)"
                fontFamily="inherit"
              >
                {min}
              </text>

              {/* 100 en bas à droite */}
              <text
                x={cx + r}
                y={cy + size * 0.10}
                textAnchor="middle"
                fontSize={size * 0.04}
                fill="var(--muted-foreground)"
                fontFamily="inherit"
              >
                {max}
              </text>

              {/* Valeur% en h5 au centre du demi-cercle */}
              <foreignObject
                x={cx - r * 0.8}
                y={cy - r * 0.65}
                width={r * 1.6}
                height={r * 0.6}
              >
                <div
                className="flex flex-col items-center justify-center w-full h-full"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}
                >
                  <p className="text-sm text-muted-foreground">score</p>
                  <h5 className="font bold">{value}%</h5>
                </div>
              </foreignObject>
            </>
          )}
        </svg>
      )}
    </div>
  )
}