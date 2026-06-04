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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { CreateScanFormValues } from "../_validators/create-scan-schema"

interface PreviewProps {
  form: UseFormReturn<CreateScanFormValues>
}

export default function Preview({
  form,
}: PreviewProps) {
  const name = form.watch("name")
  const scanType = form.watch("scanType")
  const targets = form.watch("targets") ?? []

  const ips = targets.filter(
    (target) => target.targetType === "ip"
  ).length

  const cidrs = targets.filter(
    (target) => target.targetType === "cidr"
  ).length

  const domains = targets.filter(
    (target) => target.targetType === "domain"
  ).length

  const modules =
    scanType === "network"
      ? ["Host Discovery", "Port Scan"]
      : scanType === "web"
        ? ["HTTP Detection", "Technology Detection"]
        : [
          "Host Discovery",
          "Port Scan",
          "Service Detection",
          "HTTP Detection",
        ]

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>
          {name || "New Scan"}
        </CardTitle>

        <CardDescription>
          Real-time scan overview
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <GlobeIcon className="size-4" />
              Targets
            </div>

            <p className="mt-2 text-2xl font-semibold">
              {targets.length}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <NetworkIcon className="size-4" />
              Scope
            </div>

            <p className="mt-2 text-2xl font-semibold">
              Coming soon
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {ips} IPs
          </Badge>

          <Badge variant="secondary">
            {cidrs} CIDRs
          </Badge>

          <Badge variant="secondary">
            {domains} Domains
          </Badge>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium">
            Enabled Modules
          </h4>

          <div className="flex flex-wrap gap-2">
            {modules.map((module) => (
              <Badge
                key={module}
                variant="outline"
              >
                {module}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium">
            Targets
          </h4>

          <div className="space-y-2">
            {targets.map((target, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <span className="truncate">
                  {target.target || "Empty target"}
                </span>

                <Badge variant="outline">
                  {target.targetType}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TimerIcon className="size-4" />
          Estimated duration: dynamic later
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldIcon className="size-4" />
          Reconnaissance mode
        </div>
      </CardContent>
    </Card>
  )
}