"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Settings2,
  Trash2,
  X,
} from "lucide-react"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Pagination serveur
  pageCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  total?: number
  // Recherche serveur
  search?: string
  onSearchChange?: (search: string) => void
  searchPlaceholder?: string
  // Actions
  onDeleteSelected?: (ids: string[]) => void
  getRowId?: (row: TData) => string
}

function exportToCsv<TData>(
  data: TData[],
  columns: ColumnDef<TData, unknown>[],
  filename = "export.csv"
) {
  const headers = columns
    .filter((col) => col.id !== "select" && col.id !== "actions")
    .map((col) =>
      typeof col.header === "string" ? col.header : (col.id ?? "")
    )

  const rows = data.map((row) =>
    columns
      .filter((col) => col.id !== "select" && col.id !== "actions")
      .map((col) => {
        const key = (col as { accessorKey?: string }).accessorKey ?? col.id ?? ""
        const val = (row as Record<string, unknown>)[key]
        if (val === null || val === undefined) return ""
        if (typeof val === "object") return JSON.stringify(val)
        return String(val).replace(/"/g, '""')
      })
      .map((v) => `"${v}"`)
      .join(",")
  )

  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  total,
  search = "",
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  onDeleteSelected,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    // Pagination manuelle — le serveur contrôle
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
  })

  const selectedRows = table.getSelectedRowModel().rows
  const selectedIds = selectedRows.map((r) =>
    getRowId ? getRowId(r.original) : r.id
  )
  const hasSelection = selectedRows.length > 0

  const canPrev = pageIndex > 0
  const canNext = pageIndex < pageCount - 1

  return (
    <div className="space-y-3">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {onSearchChange && (
            <div className="relative">
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  onSearchChange(e.target.value)
                  onPageChange(0)
                }}
                className="h-8 w-[200px] text-sm"
              />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    onSearchChange("")
                    onPageChange(0)
                  }}
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasSelection && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedRows.length} sélectionné
                {selectedRows.length > 1 ? "s" : ""}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() =>
                  exportToCsv(
                    selectedRows.map((r) => r.original),
                    columns as ColumnDef<TData, unknown>[],
                    "selection.csv"
                  )
                }
              >
                <Download className="w-3.5 h-3.5" />
                Exporter
              </Button>
              {onDeleteSelected && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    onDeleteSelected(selectedIds)
                    setRowSelection({})
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </Button>
              )}
            </div>
          )}

          {!hasSelection && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() =>
                exportToCsv(
                  data,
                  columns as ColumnDef<TData, unknown>[],
                  "export.csv"
                )
              }
            >
              <Download className="w-3.5 h-3.5" />
              Exporter
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Settings2 className="w-3.5 h-3.5" />
                Colonnes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Afficher</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (col) =>
                    col.getCanHide() &&
                    col.id !== "select" &&
                    col.id !== "actions"
                )
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="text-xs"
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(v)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border/50 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium text-muted-foreground h-9"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="
                    border-border/50 transition-colors
                    hover:bg-secondary/50
                    data-[state=selected]:bg-secondary
                  "
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground">
          {hasSelection
            ? `${selectedRows.length} / `
            : ""}
          {total ?? data.length} résultat
          {(total ?? data.length) !== 1 ? "s" : ""}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Lignes par page
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                onPageSizeChange(Number(v))
                onPageChange(0)
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Page {pageIndex + 1} / {pageCount || 1}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onPageChange(0)}
              disabled={!canPrev}
              aria-label="Première page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={!canPrev}
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={!canNext}
              aria-label="Page suivante"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onPageChange(pageCount - 1)}
              disabled={!canNext}
              aria-label="Dernière page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}