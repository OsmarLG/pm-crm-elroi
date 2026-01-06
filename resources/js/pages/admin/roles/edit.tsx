"use client"

import * as React from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { route } from "ziggy-js"
import { type BreadcrumbItem } from "@/types"

type Permission = { id: number; name: string }
type Role = { id: number; name: string; permissions: Permission[] }

type PageProps = {
  role: Role
  permissions: Permission[]
}

type PermissionGroup = {
  key: string
  title: string
  items: Permission[]
}

function titleizeGroupKey(key: string) {
  return key
    .split("_")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" / ")
}

function groupPermissions(perms: Permission[]): PermissionGroup[] {
  const map = new Map<string, Permission[]>()

  for (const p of perms) {
    const key = (p.name.split(".")[0] || "other").trim()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }

  return Array.from(map.entries())
    .map(([key, items]) => ({
      key,
      title: titleizeGroupKey(key),
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export default function RolesEditPage({ role, permissions }: PageProps) {
  const groups = React.useMemo(() => groupPermissions(permissions), [permissions])

  const { data, setData, put, processing, errors } = useForm<{
    name: string
    permissions: number[]
  }>({
    name: role.name ?? "",
    permissions: role.permissions?.map((p) => p.id) ?? [],
  })

  const selected = data.permissions ?? []

  const togglePermission = (id: number, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selected, id]))
      : selected.filter((x) => x !== id)

    setData("permissions", next)
  }

  const toggleGroup = (items: Permission[], checked: boolean) => {
    const ids = items.map((i) => i.id)
    const next = checked
      ? Array.from(new Set([...selected, ...ids]))
      : selected.filter((x) => !ids.includes(x))

    setData("permissions", next)
  }

  const isGroupFullyChecked = (items: Permission[]) => {
    if (!items.length) return false
    return items.every((p) => selected.includes(p.id))
  }

  const isGroupPartiallyChecked = (items: Permission[]) => {
    if (!items.length) return false
    const some = items.some((p) => selected.includes(p.id))
    return some && !isGroupFullyChecked(items)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route("admin.roles.update", role.id))
  }

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Roles",
      href: "/admin/roles"
    },
    {
      title: `#${role.id}`,
      href: `/admin/roles/${role.id}`
    },
    {
      title: "Edit",
      href: `/admin/roles/${role.id}/edit`
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit role: ${role.name}`} />

      <div className="max-w-5xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Edit role</h1>
            <p className="text-sm text-muted-foreground">{role.name}</p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={route("admin.roles.show", role.id)}>View</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={route("admin.roles.index")}>Back</Link>
            </Button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={data.name} onChange={(e) => setData("name", e.target.value)} />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Permissions</label>
              <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {groups.map((g) => {
                const fully = isGroupFullyChecked(g.items)
                const partial = isGroupPartiallyChecked(g.items)

                return (
                  <div key={g.key} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={partial ? "indeterminate" : fully}
                          onCheckedChange={(v) => toggleGroup(g.items, !!v)}
                        />
                        <span className="font-medium">{g.title}</span>
                      </label>

                      <span className="text-xs text-muted-foreground">{g.items.length}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {g.items.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 rounded-md border p-2">
                          <Checkbox
                            checked={selected.includes(p.id)}
                            onCheckedChange={(v) => togglePermission(p.id, !!v)}
                          />
                          <span className="text-sm">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {errors.permissions && <p className="text-sm text-red-500">{errors.permissions}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={route("admin.roles.index")}>Cancel</Link>
            </Button>
            <Button disabled={processing}>Save changes</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
