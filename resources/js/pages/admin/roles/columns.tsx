"use client"

import * as React from "react"
import { router, usePage } from "@inertiajs/react"
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

export interface RoleRow {
  id: number
  name: string
  guard_name?: string
  permissions_count?: number
  created_at: string
  updated_at: string
}

type PageProps = {
  auth: {
    user: any | null
    permissions: string[]
    roles: string[] // roles del usuario logueado
  }
}

const PROTECTED_ROLE_IDS = new Set([1, 2, 3])

const hasRole = (roles: string[] | undefined, role: string) =>
  Array.isArray(roles) && roles.includes(role)

/**
 * Decide si el usuario logueado puede editar el role (fila).
 * - master: puede editar todos menos "master"
 * - admin: NO puede editar "master" ni "admin"
 * - otros: false (o lo que quieras)
 */
const canEditRoleRow = (authRoles: string[] | undefined, rowRoleName: string) => {
  const isMaster = hasRole(authRoles, "master")
  const isAdmin = hasRole(authRoles, "admin")

  // master no puede editar su propio rol (master)
  if (isMaster) return rowRoleName !== "master"

  // admin no puede editar master ni su propio rol (admin)
  if (isAdmin) return rowRoleName !== "master" && rowRoleName !== "admin"

  return false
}

export const roleColumns: ColumnDef<RoleRow>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const rows = table.getRowModel().rows

      // Solo filas elegibles (no protegidas)
      const eligibleRows = rows.filter((row) => !PROTECTED_ROLE_IDS.has((row.original as any).id))

      const allEligibleSelected =
        eligibleRows.length > 0 && eligibleRows.every((row) => row.getIsSelected())

      const someEligibleSelected = eligibleRows.some((row) => row.getIsSelected())

      return (
        <Checkbox
          checked={allEligibleSelected || (someEligibleSelected && "indeterminate")}
          onCheckedChange={(value) => {
            const checked = !!value
            eligibleRows.forEach((row) => row.toggleSelected(checked))
          }}
          aria-label="Select all"
        />
      )
    },
    cell: ({ row }) => {
      const role = row.original
      const isProtected = PROTECTED_ROLE_IDS.has(role.id)

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={isProtected}
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },

  { accessorKey: "id", header: "ID", cell: ({ row }) => <div className="tabular-nums">{row.getValue("id")}</div> },
  { accessorKey: "name", header: "Nombre", cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
  { accessorKey: "permissions_count", header: "Permisos", cell: ({ row }) => <div className="tabular-nums">{row.getValue("permissions_count") ?? 0}</div> },
  { accessorKey: "created_at", header: "Created At", cell: ({ row }) => <div>{row.getValue("created_at")}</div> },
  { accessorKey: "updated_at", header: "Updated At", cell: ({ row }) => <div>{row.getValue("updated_at")}</div> },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { auth } = usePage<PageProps>().props
      const authRoles = auth?.roles ?? []

      const role = row.original
      const isProtected = PROTECTED_ROLE_IDS.has(role.id)

      const canEdit = canEditRoleRow(authRoles, role.name)

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

            <DropdownMenuItem onClick={() => router.visit(`/admin/roles/${role.id}`)}>
              View
            </DropdownMenuItem>

            {/* ✅ Edit SOLO si puede */}
            {canEdit ? (
              <DropdownMenuItem onClick={() => router.visit(`/admin/roles/${role.id}/edit`)}>
                Edit
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="opacity-60">
                Edit (not allowed)
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Delete sigue por tu regla actual */}
            {!isProtected ? (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  if (!confirm(`Delete role #${role.id} (${role.name})?`)) return

                  router.delete(`/admin/roles/${role.id}`, {
                    preserveScroll: true,
                    onSuccess: () => toast.success("Role deleted successfully."),
                    onError: () => toast.error("Failed to delete role."),
                  })
                }}
              >
                Delete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="opacity-60">
                Protected (can’t delete)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
