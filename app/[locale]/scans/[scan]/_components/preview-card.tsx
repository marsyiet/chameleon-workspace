import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Globe, Network, Layers, Database, Terminal, Cloud, KeyRound, ArrowRight } from 'lucide-react'
import { Asset } from '@/types/asset'

const TYPE_CONFIG: Record<
  Asset["assetType"],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  web: { label: "Applications web", icon: Layers },
  database: { label: "Bases de données", icon: Database },
  api: { label: "APIs", icon: Globe },
  "remote-access": { label: "Accès distants", icon: Terminal },
  mail: { label: "Messagerie", icon: Cloud },
  authentication: { label: "Points d'authentification", icon: KeyRound },
  network: { label: "Équipements réseau", icon: Network },
  unknown: { label: "Non classifiés", icon: Network },
}

interface AssetsPreviewCardProps {
  className?: string
  assets: Asset[]
  onViewAll?: () => void
}

const AssetsPreviewCard = ({ className, assets, onViewAll }: AssetsPreviewCardProps) => {
  const counts = assets.reduce<Record<string, number>>((acc, asset) => {
    acc[asset.assetType] = (acc[asset.assetType] ?? 0) + 1
    return acc
  }, {})

  const rows = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h5 className="text-foreground">Actifs découverts</h5>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-4">
            Aucun actif découvert pour l'instant.
          </p>
        ) : (
          <ul className="space-y-1">
            {rows.map(([type, count]) => {
              const config = TYPE_CONFIG[type as Asset["assetType"]] ?? TYPE_CONFIG.unknown
              const Icon = config.icon
              return (
                <li
                  key={type}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-accent transition-colors cursor-default"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-sm truncate">{config.label}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          {assets.length} actif{assets.length > 1 ? "s" : ""} au total
        </p>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto gap-1 text-muted-foreground"
          onClick={onViewAll}
        >
          Voir tout
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AssetsPreviewCard