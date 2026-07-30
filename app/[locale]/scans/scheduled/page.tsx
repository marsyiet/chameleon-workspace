"use client"

import ScheduledScanCard from "./_components/scheduled-scan-card"
import LoaderGlobal from "../_components/loader-global"
import { useScheduledScans } from "@/hooks/scans/use-scheduled-scans"

export default function ScheduledScansPage() {
  const { data, isLoading, error } = useScheduledScans()

  const scans = [...(data ?? [])].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() -
      new Date(b.scheduledAt).getTime()
  )

  console.log("ScheduledScansPage", { scans })

  if (isLoading) return <LoaderGlobal />
  if (error) return <div>Erreur</div>

  return (
    <div className="space-y-4">
      <h3 className="font-normal flex items-center justify-center py-8">
        Planification des scans
      </h3>

      {scans.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          Aucun scan programmé pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scans.map((scan) => (
            <ScheduledScanCard key={scan.id} scan={scan} />
          ))}
        </div>
      )}
    </div>
  )
}