"use client"

import * as React from "react"
import AppLayout from "@/layouts/app-layout"
import { type BreadcrumbItem } from "@/types"
import { Head, Link, usePage } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

type Permission = { id: number; name: string }
type Role = { id: number; name: string; permissions?: Permission[] }

type UserDTO = {
  id: number
  name: string
  username: string
  email: string
  email_verified_at: string | null
  roles?: Role[]
  permissions?: Permission[]              // direct
  role_permissions?: Permission[]         // derived (si lo mandas)
  all_permissions?: Permission[]          // effective (si lo mandas)
  created_at: string | null
  updated_at: string | null
}

type PageProps = {
  auth: {
    user: any | null
    permissions: string[]
    roles: string[]
  }
}

function uniquePerms(perms: Permission[]) {
  const map = new Map<number, Permission>()
  perms.forEach((p) => map.set(p.id, p))
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export default function Show({ user }: { user: UserDTO }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Users", href: "/admin/users" },
    { title: `#${user.id}`, href: `/admin/users/${user.id}` },
  ]

  const { auth } = usePage<PageProps>().props
  const permissionsAuth = auth.permissions ?? []

  const verified = !!user.email_verified_at
  const fmt = (value: string | null) => (value ? new Date(value).toLocaleString() : "—")

  const directPerms = user.permissions ?? []
  const rolePerms =
    user.role_permissions ??
    uniquePerms((user.roles ?? []).flatMap((r) => r.permissions ?? []))

  const effectivePerms =
    user.all_permissions ??
    uniquePerms([...rolePerms, ...directPerms])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Users | #${user.id}`} />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">User #{user.id}</h1>
            <p className="text-sm text-muted-foreground">Details, roles and permissions.</p>
          </div>

          <div className="flex items-center gap-2">
            {permissionsAuth.includes("users.update") && (
              <Link href={`/admin/users/${user.id}/edit`}>
                <Button>Edit</Button>
              </Link>
            )}

            <Link href="/admin/users">
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Profile</CardTitle>
            {verified ? <Badge>Verified</Badge> : <Badge variant="destructive">Not verified</Badge>}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{user.name}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Username</div>
              <div className="font-medium">{user.username}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium break-all">{user.email}</div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                {verified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div className="text-sm text-muted-foreground ml-2">Email verified at</div>
              </div>
              <div className="font-medium">{fmt(user.email_verified_at)}</div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm text-muted-foreground">Created at</div>
                <div className="font-medium">{fmt(user.created_at)}</div>
              </div>

              <div className="grid gap-2">
                <div className="text-sm text-muted-foreground">Updated at</div>
                <div className="font-medium">{fmt(user.updated_at)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {user.roles?.length ? (
              <div className="flex flex-wrap gap-2">
                {user.roles.map((r) => (
                  <Badge key={r.id} variant="secondary">
                    {r.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned.</p>
            )}
          </CardContent>
        </Card>

        {/* Permissions by roles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Permissions (from roles)</CardTitle>
            <Badge variant="outline">{rolePerms.length}</Badge>
          </CardHeader>
          <CardContent>
            {rolePerms.length ? (
              <div className="flex flex-wrap gap-2">
                {rolePerms.map((p) => (
                  <Badge key={p.id} variant="outline">
                    {p.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No role permissions.</p>
            )}
          </CardContent>
        </Card>

        {/* Direct permissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Direct permissions</CardTitle>
            <Badge variant="outline">{directPerms.length}</Badge>
          </CardHeader>
          <CardContent>
            {directPerms.length ? (
              <div className="flex flex-wrap gap-2">
                {directPerms.map((p) => (
                  <Badge key={p.id} variant="secondary">
                    {p.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No direct permissions.</p>
            )}
          </CardContent>
        </Card>

        {/* Effective permissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Effective permissions</CardTitle>
            <Badge>{effectivePerms.length}</Badge>
          </CardHeader>
          <CardContent>
            {effectivePerms.length ? (
              <div className="flex flex-wrap gap-2">
                {effectivePerms.map((p) => (
                  <Badge key={p.id}>{p.name}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No effective permissions.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
