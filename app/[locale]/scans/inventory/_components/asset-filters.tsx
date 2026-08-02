"use client"
import { useState, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export type AssetFilters = Record<string, string[]>

interface AssetFiltersCardProps {
  assets: any[]
  selected: AssetFilters
  onChange: (groupKey: string, value: string, checked: boolean) => void
  onClear: () => void
  className?: string
}

type FacetDef = {
  key: string
  label: string
  test: (asset: any) => boolean
}

type FacetGroupDef = {
  key: string
  title: string
  facets: FacetDef[]
}

const FACET_GROUPS: FacetGroupDef[] = [
  {
    key: "role",
    title: "Type d'actif",
    facets: [
      {
        key: "network_device",
        label: "Équipements réseau",
        test: (a) =>
          (a.natureRoles ?? []).some((r: any) =>
            ["firewall_router", "network_device_generic"].includes(r.role)
          ),
      },
      {
        key: "web_app",
        label: "Applications web",
        test: (a) => (a.services ?? []).some((s: any) => s.http != null),
      },
      {
        key: "database",
        label: "Bases de données",
        test: (a) =>
          (a.services ?? []).some((s: any) =>
            ["mongodb", "mysql", "postgresql", "redis", "mssql", "oracle"].includes(
              s.service
            )
          ),
      },
      {
        key: "mail_server",
        label: "Serveurs de messagerie",
        test: (a) => (a.services ?? []).some((s: any) => s.mail != null),
      },
    ],
  },
  {
    key: "security",
    title: "Sécurité",
    facets: [
      {
        key: "has_tls",
        label: "Certificat TLS présent",
        test: (a) => (a.services ?? []).some((s: any) => s.tls != null),
      },
      {
        key: "has_auth_surface",
        label: "Point d'authentification",
        test: (a) => (a.authenticationSurfaces ?? []).length > 0,
      },
    ],
  },
  {
    key: "severity",
    title: "Criticité",
    facets: [
      { key: "critical", label: "Critique", test: (a) => a.severity === "critical" },
      { key: "high", label: "Élevée", test: (a) => a.severity === "high" },
      { key: "medium", label: "Moyenne", test: (a) => a.severity === "medium" },
      { key: "low", label: "Faible", test: (a) => a.severity === "low" },
    ],
  },
]

function FilterSection({
  group,
  assets,
  selectedValues,
  onToggle,
}: {
  group: FacetGroupDef
  assets: any[]
  selectedValues: string[]
  onToggle: (value: string, checked: boolean) => void
}) {
  const [open, setOpen] = useState(true)

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const facet of group.facets) {
      map[facet.key] = assets.filter(facet.test).length
    }
    return map
  }, [assets, group.facets])

  return (
    <div className="border-b border-border py-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between font-semibold text-foreground"
      >
        {group.title}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2.5">
          {group.facets.map((facet) => {
            const checked = selectedValues.includes(facet.key)
            const count = counts[facet.key]
            return (
              <label
                key={facet.key}
                className="flex cursor-pointer items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={count === 0 && !checked}
                    onChange={(e) => onToggle(facet.key, e.target.checked)}
                    className="size-4 rounded border-muted-foreground/40 accent-foreground"
                  />
                  <span
                    className={cn(
                      count === 0 && !checked
                        ? "text-muted-foreground/50"
                        : checked
                        ? "text-foreground font-medium"
                        : "text-foreground/80"
                    )}
                  >
                    {facet.label}
                  </span>
                </span>
                <span className="text-muted-foreground">{count}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AssetFiltersCard({
  assets,
  selected,
  onChange,
  onClear,
  className,
}: AssetFiltersCardProps) {
  const totalSelected = Object.values(selected).flat().length

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <h5 className="text-foreground font-semibold">Filtres</h5>
        {totalSelected > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Réinitialiser ({totalSelected})
          </button>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {FACET_GROUPS.map((group) => (
          <FilterSection
            key={group.key}
            group={group}
            assets={assets}
            selectedValues={selected[group.key] ?? []}
            onToggle={(value, checked) => onChange(group.key, value, checked)}
          />
        ))}
      </CardContent>
    </Card>
  )
}

export { FACET_GROUPS }