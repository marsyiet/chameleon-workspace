"use client"

import { DataTable } from "@/components/data-table"
import { columns } from "./_components/columns"
import { useScans } from "@/hooks/scans/use-scans"


export default function ScansPage() {
  const {
    data,
    isLoading,
    error,
  } = useScans()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading scans</div>
  }

  return (
    <DataTable
      columns={columns}
      data={data.data.scans}
    />
  )
}