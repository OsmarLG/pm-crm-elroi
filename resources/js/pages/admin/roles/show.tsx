// resources/js/pages/admin/roles/show.tsx
"use client"

import { Head, Link } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { route } from "ziggy-js"
import { groupPermissions } from "@/utils/group-permissions"
import { type BreadcrumbItem } from "@/types"

type Permission = { id: number; name: string }
type Role = { id: number; name: string; guard_name?: string; permissions: Permission[] }

type PageProps = {
  role: Role
}

export default function RolesShowPage({ role }: PageProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Roles", href: "/admin/roles" },
    { title: `#${role.id}`, href: `/admin/roles/${role.id}` },
  ]
  const grouped = groupPermissions(role.permissions ?? [])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Role: ${role.name}`} />

      <div className="max-w-3xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{role.name}</h1>
            <p className="text-sm text-muted-foreground">
              Guard: {role.guard_name ?? "web"} • Permissions: {role.permissions?.length ?? 0}
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={route("admin.roles.index")}>Back</Link>
            </Button>
            <Button asChild>
              <Link href={route("admin.roles.edit", role.id)}>Edit</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-medium">Permisssions</h2>

          {grouped.map((g) => (
            <div key={g.key} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">{g.title}</h3>
                <span className="text-xs text-muted-foreground">{g.items.length}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {g.items.map((p) => (
                  <span key={p.id} className="rounded-md border px-2 py-1 text-sm">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
