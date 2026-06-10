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
      <h3>Scans</h3>
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