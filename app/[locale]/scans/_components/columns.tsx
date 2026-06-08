"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import {
  CircleCheckIcon,
  LoaderIcon,
  EllipsisVerticalIcon,
  Clock3Icon,
  XCircleIcon,
} from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ScanTarget {
  id: string
  target: string
  targetType: string
  status: string
}

export interface Scan {
  _id: string
  name: string
  description: string
  scanType: string
  status: string
  progress: number
  assetsDiscovered: number
  createdAt: string
  targets: ScanTarget[]
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline">
          <CircleCheckIcon className="size-3.5 fill-green-500 text-green-500" />
          Completed
        </Badge>
      )

    case "running":
      return (
        <Badge variant="outline">
          <LoaderIcon className="size-3.5 animate-spin" />
          Running
        </Badge>
      )

    case "failed":
      return (
        <Badge variant="outline">
          <XCircleIcon className="size-3.5 text-destructive" />
          Failed
        </Badge>
      )

    default:
      return (
        <Badge variant="outline">
          <Clock3Icon className="size-3.5" />
          Pending
        </Badge>
      )
  }
}

export const columns: ColumnDef<Scan>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() &&
              "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(
              !!value
            )
          }
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) =>
            row.toggleSelected(!!value)
          }
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: "Scan",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {row.original.name}
        </span>

        <span className="text-xs text-muted-foreground">
          {row.original.description}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "scanType",
    header: "Type",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="capitalize"
      >
        {row.original.scanType}
      </Badge>
    ),
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status}
      />
    ),
  },

  {
    id: "targets",
    header: "Targets",
    cell: ({ row }) => (
      <span>
        {row.original.targets.length}
      </span>
    ),
  },

  {
    accessorKey: "assetsDiscovered",
    header: "Assets",
  },

  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => (
      <span>
        {row.original.progress}%
      </span>
    ),
  },

  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      new Date(
        row.original.createdAt
      ).toLocaleDateString(),
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
          >
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/scans/${row.original._id}`}
            >
              View
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]