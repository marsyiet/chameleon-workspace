"use client"
import React, { useState, useMemo } from "react"
import AssetListCard from "./_components/assets-list-card"
import AssetFiltersCard, { type AssetFilters } from "./_components/asset-filters"
import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { parseAssetQuery } from "@/lib/parse-asset-query"
import AssetSearchBar from "@/components/custom/asset-searchbar"

const Page = () => {
    const { data: assets } = useInventoryAssets()
    const assetsArray = Array.isArray(assets) ? assets : []

    const [query, setQuery] = useState("")
    const { freeText, filters } = useMemo(() => parseAssetQuery(query), [query])

    const handleFilterChange = (groupKey: string, value: string, checked: boolean) => {
        // On reconstruit la query texte à partir des filtres cochés, pour rester synchro avec la barre
        const facetToken = Object.entries({
            "role:network_device": "role:router",
            "role:web_app": "role:web",
            "role:database": "role:database",
            "role:mail_server": "role:mail",
            "security:has_tls": "tls:true",
            "security:has_auth_surface": "auth:true",
            "severity:critical": "severity:critical",
            "severity:high": "severity:high",
            "severity:medium": "severity:medium",
            "severity:low": "severity:low",
        }).find(([key]) => key === `${groupKey}:${value}`)?.[1]

        if (!facetToken) return

        const tokens = query.trim().split(/\s+/).filter(Boolean)
        const next = checked
            ? [...tokens, facetToken]
            : tokens.filter((t) => t.toLowerCase() !== facetToken)

        setQuery(next.join(" "))
    }

    const handleClear = () => setQuery("")

    const resultCount = useMemo(() => {
        const q = freeText.toLowerCase()
        return assetsArray.filter((asset) => {
            const matchesText =
                !q ||
                asset.ipAddress?.toLowerCase().includes(q) ||
                asset.hostname?.toLowerCase().includes(q) ||
                asset.rdns?.toLowerCase().includes(q) ||
                (asset.tags ?? []).some((t: string) => t.toLowerCase().includes(q)) ||
                asset.os?.toLowerCase().includes(q)
            return matchesText
        }).length
    }, [assetsArray, freeText])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <h3 className="font-normal flex items-center justify-center py-8">
                    Inventaire
                </h3>
                <AssetSearchBar value={query} onChange={setQuery} resultCount={resultCount} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="lg:col-span-1 flex flex-col gap-4 sticky top-4 self-start">
                    <AssetFiltersCard
                        assets={assetsArray}
                        selected={filters}
                        onChange={handleFilterChange}
                        onClear={handleClear}
                    />
                </div>

                <AssetListCard className="lg:col-span-1" activeFilters={filters} search={freeText} />
            </div>
        </div>
    )
}

export default Page