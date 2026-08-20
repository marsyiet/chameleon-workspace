"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import {
  EllipsisVerticalIcon,
  MapPinIcon,
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
import { Organization } from "@/types/organization"

export const columns: ColumnDef<Organization>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: "Organisation",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </span>
          )}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "sector",
    header: "Secteur",
    cell: ({ row }) =>
      row.original.sector ? (
        <Badge variant="outline" className="capitalize">
          {row.original.sector}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },

  {
    id: "city",
    header: "Localisation",
    cell: ({ row }) =>
      row.original.geo?.city ? (
        <span className="flex items-center gap-1.5 text-sm">
          <MapPinIcon className="size-3.5 text-muted-foreground" />
          {row.original.geo.city}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },

  {
    id: "declaredDomains",
    header: "Domaines déclarés",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.declaredPerimeter?.domains?.length ?? 0}
      </span>
    ),
  },

  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },

  {
    accessorKey: "createdAt",
    header: "Créée le",
    cell: ({ row }) => (
      <p className="text-xs text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </p>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/organizations/${row.original._id}`}>Voir</Link>
          </DropdownMenuItem>

          <DropdownMenuItem>Modifier</DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive">Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]