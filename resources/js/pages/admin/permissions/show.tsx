"use client"

import * as React from "react"
import AppLayout from "@/layouts/app-layout"
import { type BreadcrumbItem } from "@/types"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Role = { id: number; name: string }

type PermissionDTO = {
  id: number
  name: string
  guard_name?: string
  roles: Role[]
}

export default function Show({ permission }: { permission: PermissionDTO }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Permissions", href: "/admin/roles/permissions" },
    { title: `#${permission.id}`, href: `/admin/roles/permissions/${permission.id}` },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Permissions | #${permission.id}`} />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Permission #{permission.id}</h1>
            <p className="text-sm text-muted-foreground">Permission details and assigned roles.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/roles/permissions/${permission.id}/edit`}>
              <Button>Edit</Button>
            </Link>

            <Link href="/admin/roles/permissions">
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Permission</CardTitle>
            <Badge>{permission.guard_name ?? "web"}</Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{permission.name}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Roles</div>

              {permission.roles?.length ? (
                <div className="flex flex-wrap gap-2">
                  {permission.roles.map((r) => (
                    <span key={r.id} className="inline-flex items-center rounded-md border px-2 py-1 text-xs">
                      {r.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No roles assigned.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
