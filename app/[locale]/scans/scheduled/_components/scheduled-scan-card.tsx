"use client"

import { formatDistanceToNow, format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarClock, Network, Globe, Shield } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScheduledScan } from "@/hooks/scans/use-scheduled-scans"


const SCAN_TYPE_ICON = {
  network: Network,
  web: Globe,
  full: Shield,
}

const SCAN_TYPE_LABEL = {
  network: "Network",
  web: "Web",
  full: "Full",
}

interface ScheduledScanCardProps {
  scan: ScheduledScan
}

export default function ScheduledScanCard({
  scan,
}: ScheduledScanCardProps) {
  const scheduledDate = new Date(scan.scheduledAt)
  const Icon = SCAN_TYPE_ICON[scan.scanType] ?? Shield

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-80"
        style={{ background: "var(--gradient-primary)" }}
      />

      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="min-w-0">
          <h4 className="font-medium truncate">{scan.name}</h4>
          {scan.description && (
            <p className="text-sm text-muted-foreground truncate">
              {scan.description}
            </p>
          )}
        </div>

        <Badge
          variant="outline"
          className="shrink-0 flex items-center gap-1"
        >
          <Icon className="size-3.5" />
          {SCAN_TYPE_LABEL[scan.scanType] ?? scan.scanType}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <CalendarClock className="size-4 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">
              {format(scheduledDate, "PPP à HH:mm", { locale: fr })}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(scheduledDate, {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {scan.targets.slice(0, 3).map((target:any, i:number) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-xs font-normal"
            >
              {target.target}
            </Badge>
          ))}
          {scan.targets.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{scan.targets.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}