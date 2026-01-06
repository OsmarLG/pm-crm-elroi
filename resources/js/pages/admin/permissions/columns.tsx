"use client"

import * as React from "react"
import { router } from "@inertiajs/react"
import { toast } from "sonner"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type PermissionRow = {
  id: number
  name: string
  guard_name?: string
  roles_count?: number
  created_at?: string
  updated_at?: string
}

export const permissionColumns: ColumnDef<PermissionRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "id", header: "ID", cell: ({ row }) => <div className="tabular-nums">{row.getValue("id")}</div> },
  { accessorKey: "name", header: "Nombre", cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
  {
    accessorKey: "roles_count",
    header: "Roles",
    cell: ({ row }) => <div className="tabular-nums">{row.getValue("roles_count") ?? 0}</div>,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => <div>{row.getValue("created_at")}</div>,
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }) => <div>{row.getValue("updated_at")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const perm = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => router.visit(`/admin/roles/permissions/${perm.id}`)}>
              View
            </DropdownMenuItem>
{/* 
            <DropdownMenuItem onClick={() => router.visit(`/admin/roles/permissions/${perm.id}/edit`)}>
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator /> */}

            {/* <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => {
                if (!confirm(`Delete permission #${perm.id} (${perm.name})?`)) return

                router.delete(`/admin/roles/permissions/${perm.id}`, {
                  preserveScroll: true,
                  onSuccess: () => toast.success("Permission deleted successfully."),
                  onError: () => toast.error("Failed to delete permission."),
                })
              }}
            >
              Delete
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
