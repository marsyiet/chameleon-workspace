"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { cn } from "@/lib/utils"
import { SearchIcon } from "lucide-react"
import { AssetCard } from "./asset-card"

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
      asset.ipAddress?.toLowerCase().includes(query) ||
      asset.hostname?.toLowerCase().includes(query) ||
      asset.rdns?.toLowerCase().includes(query) ||
      (asset.tags ?? []).some((t) => t.toLowerCase().includes(query)) ||
      asset.os?.toLowerCase().includes(query)
    )
  })

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-foreground">Tous</h5>
          <span className="text-sm text-muted-foreground">
            {assetsArray.length} au total
          </span>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (IP, hostname, tag, OS...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Impossible de charger les actifs.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun actif ne correspond à ta recherche.
          </p>
        ) : (
          <ScrollArea className="h-[520px]">
            <div className="space-y-8 pr-2">
              {filtered.map((asset) => (
                <AssetCard key={asset._id} asset={asset} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}