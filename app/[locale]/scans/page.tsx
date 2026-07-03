"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./_components/columns"
import { useScans } from "@/hooks/scans/use-scans"
import { useDeleteScan } from "@/hooks/scans/use-delete-scan"
import LoaderGlobal from "./_components/loader-global"

export default function ScansPage() {
  const [page, setPage]     = useState(1)
  const [limit, setLimit]   = useState(10)
  const [search, setSearch] = useState("")

  const { data, isLoading, error } = useScans(page, limit, search)
  const { mutate: deleteScan }     = useDeleteScan()

  const scans     = data?.data?.scans ?? []
  const total     = data?.data?.total ?? 0
  const pageCount = Math.ceil(total / limit)

  if (isLoading) return <LoaderGlobal />
  if (error)     return <div>Erreur</div>

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="relative rounded-2xl overflow-hidden px-6 py-8 min-h-[80px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-primary)" }} />
        <div className="absolute right-8 -bottom-10 flex items-center select-none pointer-events-none">
          <img src="/images/demi.png" alt="" className=" w-60" />
        </div>
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h2 className="valenzka text-white text-3xl leading-tight">Tous les scans</h2>
            <p className="text-sm text-muted-foreground">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            </p>
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