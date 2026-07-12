"use client"

import ScheduledScanCard from "./_components/scheduled-scan-card"
import LoaderGlobal from "../_components/loader-global"
import { useScheduledScans } from "@/hooks/scans/use-scheduled-sans"

export default function ScheduledScansPage() {
  const { data, isLoading, error } = useScheduledScans()

  const scans = [...(data ?? [])].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() -
      new Date(b.scheduledAt).getTime()
  )

  if (isLoading) return <LoaderGlobal />
  if (error) return <div>Erreur</div>

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="relative rounded-2xl overflow-hidden px-6 py-8 min-h-[80px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="absolute right-8 -bottom-10 flex items-center select-none pointer-events-none">
          <img src="/images/demi.png" alt="" className=" w-60" />
        </div>
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h2 className="valenzka text-white text-3xl leading-tight">
              Scheduled scans
            </h2>
            <p className="text-sm text-muted-foreground">
              Les scans programmés, du plus proche au plus lointain.
            </p>
          </div>
        </div>
      </div>

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