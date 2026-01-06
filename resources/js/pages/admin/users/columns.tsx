"use client"

import * as React from "react"
import { usePage, router } from "@inertiajs/react"
import { toast } from "sonner"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type PageProps = {
  auth: {
    user: any | null
    permissions: string[]
    roles: string[]
  }
}

export interface UserRow {
  id: number
  name: string
  username: string
  email: string
  created_at: string
  updated_at: string
  email_verified_at: string | null
  roles?: Array<{ id: number; name: string }>
  permissions?: Array<{ id: number; name: string }> // direct permissions
}

const PROTECTED_USER_IDS = new Set([1]) // super admin

export const userColumns: ColumnDef<UserRow>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const rows = table.getRowModel().rows
      const eligibleRows = rows.filter((row) => !PROTECTED_USER_IDS.has((row.original as any).id))

      const allEligibleSelected = eligibleRows.length > 0 && eligibleRows.every((row) => row.getIsSelected())
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
      const user = row.original
      const isProtected = PROTECTED_USER_IDS.has(user.id)

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

  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="tabular-nums">{row.getValue("id")}</div>,
  },

  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },

  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => <div className="font-medium">{row.getValue("username")}</div>,
  },

  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase truncate max-w-[360px]">{row.getValue("email")}</div>,
  },

  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = (row.getValue("roles") as any[]) ?? []
      if (!roles.length) return <span className="text-sm text-muted-foreground">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((r) => (
            <Badge key={r.id} variant="secondary">
              {r.name}
            </Badge>
          ))}
        </div>
      )
    },
  },

  {
    accessorKey: "permissions",
    header: "Direct perms",
    cell: ({ row }) => {
      const perms = (row.getValue("permissions") as any[]) ?? []
      if (!perms.length) return <span className="text-sm text-muted-foreground">—</span>

      return (
        <div className="flex flex-wrap gap-1 max-w-[360px]">
          {perms.slice(0, 6).map((p) => (
            <Badge key={p.id} variant="outline">
              {p.name}
            </Badge>
          ))}
          {perms.length > 6 && (
            <Badge variant="outline">+{perms.length - 6}</Badge>
          )}
        </div>
      )
    },
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
    accessorKey: "email_verified_at",
    header: "Verified",
    cell: ({ row }) => {
      const value = row.getValue<string | null>("email_verified_at")
      const verified = !!value

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                {verified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </TooltipTrigger>

            {verified && (
              <TooltipContent>
                <span>Verified at {new Date(value!).toLocaleString()}</span>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original
      const { auth } = usePage<PageProps>().props
      const permissions = auth.permissions ?? []
      const currentUserId = auth?.user?.id

      const isProtected = PROTECTED_USER_IDS.has(user.id)
      const isSelf = currentUserId === user.id

      const canView = permissions.includes("users.view")
      const canEdit = permissions.includes("users.update") && !isProtected
      const canDelete = permissions.includes("users.delete") && !isProtected && !isSelf

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

            {canView && (
              <>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                  Copy User Email
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.visit(`/admin/users/${user.id}`)}>
                  View
                </DropdownMenuItem>
              </>
            )}

            {canEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.visit(`/admin/users/${user.id}/edit`)}>
                  Edit
                </DropdownMenuItem>
              </>
            )}

            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {
                    if (!confirm(`Delete user #${user.id} (${user.email})?`)) return

                    router.delete(`/admin/users/${user.id}`, {
                      preserveScroll: true,
                      onSuccess: () => toast.success("User deleted successfully."),
                      onError: () => toast.error("Failed to delete user."),
                    })
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}

            {!canEdit && !canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="opacity-60">
                  No actions available
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
