"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, ServerIcon, MapPinIcon, NetworkIcon, GlobeIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { MetricCard } from "./_components/metric-card"

export default function DashboardPage() {
  const router = useRouter()
  const { data: assets, isLoading } = useInventoryAssets()
  const [search, setSearch] = useState("")

  const assetsArray = Array.isArray(assets) ? assets : []

  const totalAssets = assetsArray.length

  const uniqueIps = new Set(
    assetsArray.map((a) => a.ipAddress).filter(Boolean)
  ).size

  const uniqueDomains = new Set(
    assetsArray.map((a) => a.rootDomain || a.hostname).filter(Boolean)
  ).size

  const uniqueZones = new Set(
    assetsArray.map((a) => a.geo?.city || a.geo?.country).filter(Boolean)
  ).size

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/scans/inventory?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="w-full mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-8 items-center justify-center">
        <Badge className="mt-8">Demo</Badge>
        <h2 className="font-normal">Tableau de bord</h2>
        <p>Explorez vos actifs et leur état de sécurité</p>

        <div className="relative w-full">
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher un actif (IP, domaine, hostname...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 pl-12 pr-28 text-base rounded-full shadow-sm"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Rechercher
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
        <MetricCard
          icon={ServerIcon}
          label="Actifs découverts"
          value={totalAssets}
          isLoading={isLoading}
          accent="violet"
        />
        <MetricCard
          icon={MapPinIcon}
          label="Zones géographiques"
          value={uniqueZones}
          isLoading={isLoading}
          accent="teal"
        />
        <MetricCard
          icon={NetworkIcon}
          label="Adresses IP uniques"
          value={uniqueIps}
          isLoading={isLoading}
          accent="amber"
        />
        <MetricCard
          icon={GlobeIcon}
          label="Domaines uniques"
          value={uniqueDomains}
          isLoading={isLoading}
          accent="rose"
        />
      </div>
    </div>
  )
}