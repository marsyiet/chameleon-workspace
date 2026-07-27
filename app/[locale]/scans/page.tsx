"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./_components/columns"
import { useScans } from "@/hooks/scans/use-scans"
import { useDeleteScan } from "@/hooks/scans/use-delete-scan"
import LoaderGlobal from "./_components/loader-global"

export default function ScansPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")

  const { data, isLoading, error } = useScans(page, limit, search)
  const { mutate: deleteScan } = useDeleteScan()

  const scans = data?.data?.scans ?? []
  const total = data?.data?.total ?? 0
  const pageCount = Math.ceil(total / limit)

  if (isLoading) return <LoaderGlobal />
  if (error) return <div>Erreur</div>

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="relative rounded-2xl overflow-hidden px-6 py-8 min-h-[80px] border border-border bg-card">
        <div className="absolute inset-0
    bg-gradient-to-t
    from-white via-slate-100/70 to-slate-50/20
    dark:from-black/90
    dark:via-black/40
    dark:to-black/20
  " />

        <div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{ background: "var(--gradient-primary)" }}
        />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className=" text-foreground dark:text-white">
              Tous les scans
            </h3>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={scans}
        pageCount={pageCount}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={(p) => setPage(p + 1)}
        onPageSizeChange={(s) => { setLimit(s); setPage(1) }}
        total={total}
        search={search}
        onSearchChange={(s) => { setSearch(s); setPage(1) }}
        searchPlaceholder="Rechercher un scan..."
        getRowId={(row) => row._id}
        onDeleteSelected={(ids) => ids.forEach((id) => deleteScan(id))}
      />
    </div>

  )
}