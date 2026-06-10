"use client"

import { UseFormReturn } from "react-hook-form"
import {
  Globe,
  Network,
  Shield,
  Timer,
  Cpu,
} from "lucide-react"
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

const MODULE_COLORS: Record<string, string> = {
  "Host Discovery":       "bg-blue-50/10 text-blue-500",
  "Port Scan":            "bg-violet-50/10 text-violet-500",
  "Service Detection":    "bg-amber-50/10 text-amber-500",
  "HTTP Detection":       "bg-emerald-50/10 text-emerald-500",
  "Technology Detection": "bg-rose-50/10 text-rose-500",
}

const TYPE_COLORS: Record<string, string> = {
  ip:     "bg-blue-50/10 text-blue-500",
  cidr:   "bg-violet-50/10 text-violet-500",
  domain: "bg-emerald-50/10 text-emerald-500",
}

export default function Preview({ form }: PreviewProps) {

  function calculateScope(targets: CreateScanFormValues["targets"]): number {
    return targets.reduce((acc, t) => {
      if (t.targetType === "ip") return acc + 1
      if (t.targetType === "domain") return acc + 1
      if (t.targetType === "cidr") {
        const prefix = parseInt(t.target.split("/")[1] ?? "32")
        return acc + Math.pow(2, 32 - prefix)
      }
      return acc
    }, 0)
  }
  const name     = form.watch("name")
  const scanType = form.watch("scanType")
  const targets  = form.watch("targets") ?? []

  const ips     = targets.filter((t) => t.targetType === "ip").length
  const cidrs   = targets.filter((t) => t.targetType === "cidr").length
  const domains = targets.filter((t) => t.targetType === "domain").length

  const modules =
    scanType === "network"
      ? ["Host Discovery", "Port Scan"]
      : scanType === "web"
        ? ["HTTP Detection", "Technology Detection"]
        : ["Host Discovery", "Port Scan", "Service Detection", "HTTP Detection"]
    
  const scope = calculateScope(targets)

  return (
    <div className="sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">
          {name || "New Scan"}
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time scan overview
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Globe className="size-3.5" />
              Targets
            </div>
            <p className="text-2xl font-medium leading-none">
              {targets.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Network className="size-3.5" />
              Scope
            </div>
            <p className="text-2xl font-medium leading-none">
              {scope > 1000
                ? `${(scope / 1000).toFixed(1)}k`
                : scope}
            </p>
          </div>
        </div>

        {/* Target type breakdown */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: `${ips} IP${ips !== 1 ? "s" : ""}`, key: "ip" },
            { label: `${cidrs} CIDR${cidrs !== 1 ? "s" : ""}`, key: "cidr" },
            { label: `${domains} Domain${domains !== 1 ? "s" : ""}`, key: "domain" },
          ].map(({ label, key }) => (
            <span
              key={key}
              className={`
                text-xs font-medium px-2 py-0.5 rounded-full border
                ${TYPE_COLORS[key]}
              `}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Modules */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Cpu className="size-3.5" />
            Modules
          </p>
          <div className="flex flex-wrap gap-1.5">
            {modules.map((module) => (
              <span
                key={module}
                className={`
                  text-xs font-medium px-2 py-0.5 rounded-full border
                  ${MODULE_COLORS[module] ?? "bg-secondary text-secondary-foreground border-border"}
                `}
              >
                {module}
              </span>
            ))}
          </div>
        </div>

        {/* Targets list */}
        {targets.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2.5">
              Targets
            </p>
            <div className="space-y-1.5">
              {targets.map((target, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span className="truncate text-sm font-mono">
                    {target.target || (
                      <span className="text-muted-foreground italic">
                        Empty target
                      </span>
                    )}
                  </span>
                  <span
                    className={`
                      ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border
                      ${TYPE_COLORS[target.targetType] ?? "bg-secondary text-secondary-foreground border-border"}
                    `}
                  >
                    {target.targetType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="size-3.5 shrink-0" />
            Estimated duration: dynamic later
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="size-3.5 shrink-0" />
            Reconnaissance mode
          </div>
        </div>

      </CardContent>
    </div>
  )
}