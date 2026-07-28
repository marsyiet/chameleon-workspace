"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"

import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { useOrganizationMapPoints } from "@/hooks/organizations/use-organization-map-points"

import MapView from "./map-view"
import AssetDetailPanel from "./asset-detail-panel"
import { MapPoint } from "./types"
import { Asset } from "@/types/asset"

interface GeoMapCardProps {
  className?: string
  // Si fourni : mode "scan" — carte scopée à ces actifs uniquement, pas d'onglets.
  // Si absent : mode "global" — vue nationale (tous actifs) / organisationnelle
  // (toutes les organisations géolocalisées).
  assets?: Asset[]
}

function toOverviewPoints(assets: Asset[]): MapPoint[] {
  return assets
    .filter(
      (a) =>
        a.exposure === "externe" &&
        a.geo?.lat !== null &&
        a.geo?.lon !== null &&
        a.geo?.lat !== undefined &&
        a.geo?.lon !== undefined
    )
    .map((a) => ({
      id: a._id,
      label: a.hostname || a.ipAddress,
      sublabel: [a.geo.city, a.geo.country].filter(Boolean).join(", "),
      coords: [a.geo.lat as number, a.geo.lon as number],
      kind: "asset" as const,
      assetType: a.natureType ?? a.assetType,
      severity: a.severity,
    }))
}

export default function GeoMapCard({ className, assets: assetsProp }: GeoMapCardProps) {
  const isScanScoped = assetsProp !== undefined

  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "organizational">("overview")
  const [tilesFailed, setTilesFailed] = useState(false)

  const { data: globalAssets } = useInventoryAssets({ enabled: !isScanScoped })
  const { data: orgMapPoints } = useOrganizationMapPoints()

  const globalAssetsArray = Array.isArray(globalAssets) ? globalAssets : []

  const cardTitle = isScanScoped
    ? "Carte des actifs de ce scan"
    : activeTab === "organizational"
      ? "Carte des organisations"
      : "Carte des actifs — Cameroun"

  const overviewPoints: MapPoint[] = toOverviewPoints(isScanScoped ? assetsProp! : globalAssetsArray)

  const organizationalPoints: MapPoint[] = (orgMapPoints ?? [])
    .filter((org) => org.geo?.lat !== null && org.geo?.lon !== null)
    .map((org) => ({
      id: org._id,
      label: org.name,
      sublabel: org.geo.city ?? undefined,
      coords: [org.geo.lat as number, org.geo.lon as number],
      kind: "site" as const,
      assetCount: org.assetCount,
    }))

  const points = isScanScoped
    ? overviewPoints
    : activeTab === "overview"
      ? overviewPoints
      : organizationalPoints

  const isEmpty = points.length === 0

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h5 className="text-foreground transition-all duration-200">{cardTitle}</h5>

          {!isScanScoped && (
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as typeof activeTab)
                setSelectedPoint(null)
              }}
            >
              <TabsList>
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="organizational">Organisations</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        <MapView
          points={points}
          onSelect={setSelectedPoint}
          onTilesFailed={setTilesFailed}
        />

        {tilesFailed && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center bg-background/90 pointer-events-none">
            <p className="text-xs text-muted-foreground px-4 text-center">
              Le fond de carte n'a pas pu se charger (connexion réseau bloquée dans cet environnement).
            </p>
          </div>
        )}

        {isEmpty && !selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs z-[500] p-3 rounded-xl border border-border/80 bg-background/90 backdrop-blur-sm shadow-md flex gap-2.5 items-start">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-foreground">
                Aucune donnée à afficher
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {isScanScoped
                  ? "Aucun actif externe géolocalisé pour ce scan."
                  : activeTab === "overview"
                    ? "Aucun actif externe géolocalisé pour le moment."
                    : "Aucune organisation géolocalisée pour le moment."}
              </p>
            </div>
          </div>
        )}

        <AssetDetailPanel point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground select-none">
          {isScanScoped
            ? `${points.length} actif(s) géolocalisé(s) · Molette pour zoomer`
            : activeTab === "overview"
              ? `${points.length} actif(s) géolocalisé(s) · Molette pour zoomer`
              : `${points.length} organisation(s) · Molette pour zoomer`}
        </p>
      </CardFooter>
    </Card>
  )
}