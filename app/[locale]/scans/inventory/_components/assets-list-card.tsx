"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
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
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* En-tête + Barre de recherche */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h5 className="text-foreground font-semibold">Tous</h5>
          <span className="text-sm text-muted-foreground font-medium">
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

      {/* Contenu principal sans contrainte de ScrollArea interne */}
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