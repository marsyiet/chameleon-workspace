import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Globe, Network, Layers, Database, Terminal, Cloud, ArrowRight } from 'lucide-react'

const assets = [
  { label: "Domaines & sous-domaines", icon: Globe,    count: 142 },
  { label: "Services réseau",          icon: Network,  count: 87  },
  { label: "Applications web",         icon: Layers,   count: 34  },
  { label: "Bases de données",         icon: Database, count: 12  },
  { label: "Accès distants",           icon: Terminal, count: 9   },
  { label: "Actifs cloud",             icon: Cloud,    count: 6   },
]

const AssetsPreviewCard = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h5 className="valenzka text-foreground">Meilleurs résultats découverts</h5>
         
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-2">
        <ul className="space-y-1">
          {assets.map((asset) => {
            const Icon = asset.icon
            return (
              <li
                key={asset.label}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-accent transition-colors cursor-default"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-sm truncate">{asset.label}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {asset.count}
                </span>
                
              </li>
            )
          })}
        </ul>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground">
          {assets.reduce((a, b) => a + b.count, 0)} actifs au total
        </p>
         <Button size="sm" variant="ghost" className="ml-auto gap-1 text-muted-foreground">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
      </CardFooter>
    </Card>
  )
}

export default AssetsPreviewCard