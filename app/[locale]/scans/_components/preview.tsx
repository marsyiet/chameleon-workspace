"use client"
import { UseFormReturn } from "react-hook-form"
import {
  GlobeIcon,
  NetworkIcon,
  ShieldIcon,
  TimerIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateScanFormValues } from "../_validators/create-scan-schema"

interface PreviewProps {
  form: UseFormReturn<CreateScanFormValues>
}

export default function Preview({ form }: PreviewProps) {
  const name = form.watch("name")
  const scanType = form.watch("scanType")
  const targets = form.watch("targets") ?? []

  const ips = targets.filter((t) => t.targetType === "ip").length
  const cidrs = targets.filter((t) => t.targetType === "cidr").length
  const domains = targets.filter((t) => t.targetType === "domain").length

  const modules =
    scanType === "network"
      ? ["Host Discovery", "Port Scan"]
      : scanType === "web"
        ? ["HTTP Detection", "Technology Detection"]
        : ["Host Discovery", "Port Scan", "Service Detection", "HTTP Detection"]

  return (
    <div className="sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle>{name || "New Scan"}</CardTitle>
        <CardDescription>Real-time scan overview</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs mb-2">
              <GlobeIcon className="size-3.5" />
              Targets
            </div>
            <p className="text-2xl font-semibold leading-none">{targets.length}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs mb-2">
              <NetworkIcon className="size-3.5" />
              Scope
            </div>
            <p className="text-sm font-medium leading-none text-muted-foreground mt-1">Coming soon</p>
          </div>
        </div>

        {/* Target type breakdown */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{ips} IPs</Badge>
          <Badge variant="secondary">{cidrs} CIDRs</Badge>
          <Badge variant="secondary">{domains} Domains</Badge>
        </div>

        {/* Modules */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">
            Enabled Modules
          </p>
          <div className="flex flex-wrap gap-1.5">
            {modules.map((module) => (
              <Badge key={module} variant="outline">
                {module}
              </Badge>
            ))}
          </div>
        </div>

        {/* Targets list */}
        {targets.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">
              Targets
            </p>
            <div className="space-y-1.5">
              {targets.map((target, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="truncate text-sm">
                    {target.target || "Empty target"}
                  </span>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {target.targetType}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer meta */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TimerIcon className="size-3.5 shrink-0" />
            Estimated duration: dynamic later
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldIcon className="size-3.5 shrink-0" />
            Reconnaissance mode
          </div>
        </div>
      </CardContent>
    </div>
  )
}