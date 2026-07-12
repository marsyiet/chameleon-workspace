"use client"

import { useState } from "react"
import { SearchIcon, ServerIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { cn } from "@/lib/utils"
import { Asset } from "../../_constants/data-types"

type Severity = "critical" | "high" | "medium" | "low" | "informational"

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: "bg-red-500/15 text-red-600 border-red-500/30",
  high: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  informational: "bg-muted text-muted-foreground border-transparent",
}

// Sévérité provisoire calculée côté client à partir du CVSS max valide,
// en attendant que le scoring composite (chapitre 2) soit implémenté côté backend.
function deriveSeverity(asset: Asset): Severity {
  const validCvss = asset.cves
    .filter((c) => c.cvss !== null && !c.description.startsWith("Rejected reason"))
    .map((c) => c.cvss as number)

  if (validCvss.length === 0) return "informational"
  const max = Math.max(...validCvss)

  if (max >= 9) return "critical"
  if (max >= 7) return "high"
  if (max >= 4) return "medium"
  return "low"
}

function primaryLabel(asset: Asset): string {
  // Premier tag comme label de type (ex: "database/postgresql" -> "database/postgresql")
  return asset.tags[0] ?? asset.os ?? "actif inconnu"
}

interface AssetListCardProps {
  className?: string
}

export default function AssetListCard({ className }: AssetListCardProps) {
  const { data: assets, isLoading, error } = useInventoryAssets()
  const [search, setSearch] = useState("")

  const assetsArray = Array.isArray(assets) ? assets : []

  const filtered = assetsArray.filter((asset) => {
    const query = search.toLowerCase()
    return (
      asset.ip.toLowerCase().includes(query) ||
      asset.rdns?.toLowerCase().includes(query) ||
      asset.tags.some((t) => t.toLowerCase().includes(query)) ||
      asset.os?.toLowerCase().includes(query)
    )
  })

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Actifs
          <span className="text-sm font-normal text-muted-foreground">
            {assetsArray.length} au total
          </span>
        </CardTitle>

        <div className="relative mt-2">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (IP, tag, OS...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        {isLoading ? (
          <div className="space-y-2 px-4 pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">
            Impossible de charger les actifs.
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">
            Aucun actif ne correspond à ta recherche.
          </p>
        ) : (
          <ScrollArea className="h-[480px] px-4 pb-4">
            <div className="space-y-2">
              {filtered.map((asset) => {
                const severity = deriveSeverity(asset)

                return (
                  <div
                    key={asset._id}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
                      <ServerIcon className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">
                          {asset.rdns || asset.ip}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn("text-xs shrink-0", SEVERITY_STYLE[severity])}
                        >
                          {severity}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{asset.ip}</span>
                        <span>·</span>
                        <span className="truncate">{primaryLabel(asset)}</span>
                        <span>·</span>
                        <span>{asset.openPorts.length} port(s)</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}