"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export function selectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Sélectionner la ligne"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }
}

interface SortableHeaderProps {
  label: string
  column: {
    toggleSorting: (desc?: boolean) => void
    getIsSorted: () => false | "asc" | "desc"
  }
}

export function SortableHeader({ label, column }: SortableHeaderProps) {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-7 text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="w-3 h-3" />
      ) : sorted === "desc" ? (
        <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40" />
      )}
    </Button>
  )
}