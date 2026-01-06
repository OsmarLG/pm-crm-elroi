"use client"

import AppLayout from "@/layouts/app-layout"
import { type BreadcrumbItem } from "@/types"
import { Head, router, Link, usePage } from "@inertiajs/react"
import * as React from "react"

import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table/data-table"
import { InertiaPagination } from "@/components/data-table/inertia-pagination"
import type { SortingState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import { userColumns, type UserRow } from "./columns"

type PageProps = {
  auth: {
    user: any | null
    permissions: string[]
    roles: string[]
  }
}

const breadcrumbs: BreadcrumbItem[] = [{ title: "Users", href: "/admin/users" }]

interface PaginatedUsers<T> {
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

export default function Index({
  users,
  allUsersCount,
  filters,
}: {
  users: PaginatedUsers<UserRow>
  allUsersCount: number
  filters: { search?: string; sort?: string; dir?: "asc" | "desc"; per_page?: number }
}) {
  const { auth } = usePage<PageProps>().props
  const permissions = auth.permissions ?? []

  const [search, setSearch] = React.useState(filters?.search ?? "")

  const [sorting, setSorting] = React.useState<SortingState>(() => {
    const sort = filters?.sort ?? "id"
    const dir = filters?.dir ?? "desc"
    return sort ? [{ id: sort, desc: dir === "desc" }] : []
  })

  const [selectedIds, setSelectedIds] = React.useState<number[]>([])

  // sort server-side
  React.useEffect(() => {
    const s = sorting?.[0]
    const sort = s?.id ?? "id"
    const dir = s ? (s.desc ? "desc" : "asc") : "desc"

    router.get(
      "/admin/users",
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
        "/admin/users",
        { search, sort, dir, page: 1, per_page: filters?.per_page ?? 10 },
        { preserveState: true, preserveScroll: true, replace: true }
      )
    }, 300)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const from = users.meta.from ?? 0
  const to = users.meta.to ?? 0

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users | List" />

      <div className="p-4 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Users</h1>
            <p className="text-sm text-muted-foreground">
              Showing {from}–{to} of {users.meta.total} (Total system: {allUsersCount})
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="w-full md:w-[360px]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, username or email..."
              />
            </div>

            {permissions.includes("users.delete") && selectedIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (!confirm(`Delete ${selectedIds.length} user(s)?`)) return

                  router.delete("/admin/users/bulk", {
                    data: { ids: selectedIds },
                    preserveScroll: true,
                    onSuccess: () => {
                      toast.success("Users deleted successfully.")
                      setSelectedIds([])
                    },
                    onError: () => toast.error("Could not delete users."),
                  })
                }}
              >
                Delete selected ({selectedIds.length})
              </Button>
            )}

            {permissions.includes("users.create") && (
              <Link href="/admin/users/create">
                <Button>Create user</Button>
              </Link>
            )}
          </div>
        </div>

        <div>
          <DataTable
            columns={userColumns}
            data={users.data}
            sorting={sorting}
            onSortingChange={setSorting}
            sortableColumns={["id", "name", "username", "email", "created_at", "updated_at"]}
            onSelectionChange={setSelectedIds}
          />

          <InertiaPagination metaLinks={users.meta.links} prevUrl={users.links.prev} nextUrl={users.links.next} />
        </div>
      </div>
    </AppLayout>
  )
}
