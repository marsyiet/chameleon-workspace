"use client"
import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./_components/columns"
import { useOrganizations, useDeleteOrganization } from "@/hooks/organizations/organizations-hooks"
import LoaderGlobal from "../scans/_components/loader-global"

export default function OrganizationsPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading, error } = useOrganizations(page, limit, search)
  const { mutate: deleteOrganization } = useDeleteOrganization()

  const organizations = data?.data?.organizations ?? []
  const total = data?.data?.total ?? 0
  const pageCount = Math.ceil(total / limit)

  if (isLoading) return <LoaderGlobal />
  if (error) return <div>Erreur</div>

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={organizations}
        pageCount={pageCount}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={(p) => setPage(p + 1)}
        onPageSizeChange={(s) => { setLimit(s); setPage(1) }}
        total={total}
        search={search}
        onSearchChange={(s) => { setSearch(s); setPage(1) }}
        searchPlaceholder="Rechercher une organisation..."
        getRowId={(row) => row._id}
        onDeleteSelected={(ids) => ids.forEach((id) => deleteOrganization(id))}
      />
    </div>
  )
}