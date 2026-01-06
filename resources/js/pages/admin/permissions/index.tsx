"use client"

import AppLayout from "@/layouts/app-layout"
import { type BreadcrumbItem } from "@/types"
import { Head, router, Link } from "@inertiajs/react"
import * as React from "react"

import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table/data-table"
import { InertiaPagination } from "@/components/data-table/inertia-pagination"
import type { SortingState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import { permissionColumns, type PermissionRow } from "./columns"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Permissions", href: "/admin/roles/permissions" },
]

/**
 * Laravel/Inertia paginator puede venir en 2 formatos:
 * 1) Inertia style: { data, links: {prev,next...}, meta: {from,to,total,links[]} }
 * 2) Laravel “plano”: { data, from,to,total, links: [], prev_page_url, next_page_url }
 */
type InertiaPaginated<T> = {
  data: T[]
  links: { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    links: { url: string | null; label: string; active: boolean; page: number | null }[]
    per_page: number
    to: number | null
    total: number
  }
}

type LaravelPaginated<T> = {
  data: T[]
  from: number | null
  to: number | null
  total: number
  links: { url: string | null; label: string; active: boolean; page: number | null }[]
  prev_page_url: string | null
  next_page_url: string | null
}

type Paginated<T> = InertiaPaginated<T> | LaravelPaginated<T>

export default function Index({
  permissions,
  allPermissionsCount,
  filters,
}: {
  permissions: Paginated<PermissionRow>
  allPermissionsCount: number
  filters: { search?: string; sort?: string; dir?: "asc" | "desc"; per_page?: number }
}) {
  const [search, setSearch] = React.useState(filters?.search ?? "")

  const [sorting, setSorting] = React.useState<SortingState>(() => {
    const sort = filters?.sort ?? "id"
    const dir = filters?.dir ?? "desc"
    return sort ? [{ id: sort, desc: dir === "desc" }] : []
  })

  const [selectedIds, setSelectedIds] = React.useState<number[]>([])

  // Soportar ambos shapes (Inertia meta o plano)
  const meta: any = (permissions as any)?.meta ?? permissions
  const from = meta?.from ?? 0
  const to = meta?.to ?? 0
  const total = meta?.total ?? 0

  const paginationLinks =
    (permissions as any)?.meta?.links ??
    (permissions as any)?.links ??
    []

  const prevUrl =
    (permissions as any)?.links?.prev ??
    (permissions as any)?.prev_page_url ??
    null

  const nextUrl =
    (permissions as any)?.links?.next ??
    (permissions as any)?.next_page_url ??
    null

  // sort server-side
  React.useEffect(() => {
    const s = sorting?.[0]
    const sort = s?.id ?? "id"
    const dir = s ? (s.desc ? "desc" : "asc") : "desc"

    router.get(
      "/admin/roles/permissions",
      { search, sort, dir, page: 1, per_page: filters?.per_page ?? 10 },
      { preserveState: true, preserveScroll: true, replace: true }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting])

  // search server-side (debounce)
  React.useEffect(() => {
    const t = setTimeout(() => {
      const s = sorting?.[0]
      const sort = s?.id ?? (filters?.sort ?? "id")
      const dir = s ? (s.desc ? "desc" : "asc") : (filters?.dir ?? "desc")

      router.get(
        "/admin/roles/permissions",
        { search, sort, dir, page: 1, per_page: filters?.per_page ?? 10 },
        { preserveState: true, preserveScroll: true, replace: true }
      )
    }, 300)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Permissions | List" />

      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <h1 className="text-lg font-semibold">Permissions</h1>
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to} of {total} (Total system: {allPermissionsCount})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full max-w-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
            />
          </div>

          {/* {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              disabled={selectedIds.length === 0}
              onClick={() => {
                if (!confirm(`Delete ${selectedIds.length} permission(s)?`)) return

                router.delete("/admin/roles/permissions/bulk", {
                  data: { ids: selectedIds },
                  preserveScroll: true,
                  onSuccess: () => {
                    toast.success("Permissions deleted successfully.")
                    setSelectedIds([])
                  },
                  onError: () => toast.error("Could not delete permissions."),
                })
              }}
            >
              Eliminar seleccionados ({selectedIds.length})
            </Button>
          )} */}

          {/* <Link href="/admin/roles/permissions/create">
            <Button>Nueva permission</Button>
          </Link> */}
        </div>
      </div>

      <div className="p-4">
        <DataTable
          columns={permissionColumns}
          data={(permissions as any)?.data ?? []}
          sorting={sorting}
          onSortingChange={setSorting}
          sortableColumns={["id", "name", "created_at", "updated_at"]}
          onSelectionChange={setSelectedIds}
        />

        <InertiaPagination metaLinks={paginationLinks} prevUrl={prevUrl} nextUrl={nextUrl} />
      </div>
    </AppLayout>
  )
}
