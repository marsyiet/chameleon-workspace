"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { cn } from "@/lib/utils"
import { AssetCard } from "./asset-card"
import { FACET_GROUPS, type AssetFilters } from "./asset-filters"

interface AssetListCardProps {
  className?: string
  activeFilters?: AssetFilters
  search?: string
}

export default function AssetListCard({
  className,
  activeFilters = {},
  search = "",
}: AssetListCardProps) {
  const { data: assets, isLoading, error } = useInventoryAssets()
  const assetsArray = Array.isArray(assets) ? assets : []

  const filtered = assetsArray.filter((asset) => {
    const query = search.toLowerCase()
    const matchesSearch =
      !query ||
      asset.ipAddress?.toLowerCase().includes(query) ||
      asset.hostname?.toLowerCase().includes(query) ||
      asset.rdns?.toLowerCase().includes(query) ||
      (asset.tags ?? []).some((t: string) => t.toLowerCase().includes(query)) ||
      asset.os?.toLowerCase().includes(query)

    if (!matchesSearch) return false

    for (const group of FACET_GROUPS) {
      const activeInGroup = activeFilters[group.key] ?? []
      if (activeInGroup.length === 0) continue

      const matchesGroup = group.facets
        .filter((f) => activeInGroup.includes(f.key))
        .some((f) => f.test(asset))

      if (!matchesGroup) return false
    }

    return true
  })

  return (
    <div className={cn("flex flex-col space-y-4", className)}>

      <div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-border bg-card text-muted-foreground text-sm">
            Impossible de charger les actifs.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 rounded-xl border border-border bg-card text-muted-foreground text-sm">
            Aucun actif ne correspond à votre recherche.
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((asset) => (
              <AssetCard key={asset._id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}