"use client"

import * as React from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, useForm, Link } from "@inertiajs/react"
import { type BreadcrumbItem } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Role = { id: number; name: string }
type Permission = { id: number; name: string }

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Users", href: "/admin/users" },
  { title: "Create", href: "/admin/users/create" },
]

function groupPermissions(perms: Permission[]) {
  const map = new Map<string, Permission[]>()

  perms.forEach((p) => {
    const key = p.name.includes(".") ? p.name.split(".")[0] : "other"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      key,
      title: key === "other"
        ? "Other"
        : key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
}

export default function Create({
  roles,
  permissions,
}: {
  roles: Role[]
  permissions: Permission[]
}) {
  const form = useForm({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    mark_as_verified: false,
    roles: [] as number[],
    permissions: [] as number[], // direct permissions
  })

  const toggleId = (field: "roles" | "permissions", id: number, checked: boolean) => {
    const current = (form.data as any)[field] as number[]
    const next = checked
      ? Array.from(new Set([...current, id]))
      : current.filter((x) => x !== id)
    form.setData(field as any, next as any)
  }

  const groups = React.useMemo(() => groupPermissions(permissions ?? []), [permissions])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post("/admin/users")
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users | Create" />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Create user</h1>
            <p className="text-sm text-muted-foreground">
              Profile, roles and direct permissions.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href="/admin/users">Back</Link>
          </Button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: profile */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  placeholder="John Doe"
                />
                {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.data.username}
                  onChange={(e) => form.setData("username", e.target.value)}
                  placeholder="john_doe"
                />
                {form.errors.username && <p className="text-sm text-destructive">{form.errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.data.email}
                  onChange={(e) => form.setData("email", e.target.value)}
                  placeholder="john@example.com"
                />
                {form.errors.email && <p className="text-sm text-destructive">{form.errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.data.password}
                  onChange={(e) => form.setData("password", e.target.value)}
                  placeholder="********"
                />
                {form.errors.password && <p className="text-sm text-destructive">{form.errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={form.data.password_confirmation}
                  onChange={(e) => form.setData("password_confirmation", e.target.value)}
                  placeholder="********"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mark_as_verified"
                  checked={form.data.mark_as_verified}
                  onCheckedChange={(checked) => form.setData("mark_as_verified", Boolean(checked))}
                />
                <Label htmlFor="mark_as_verified" className="cursor-pointer select-none">
                  Mark as verified
                </Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={form.processing}>
                  {form.processing ? "Saving..." : "Create"}
                </Button>

                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Middle: roles */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Roles</CardTitle>
              <Badge variant="secondary">{form.data.roles.length} selected</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {(roles ?? []).map((r) => (
                  <label key={r.id} className="flex items-center gap-2 rounded-md border p-2">
                    <Checkbox
                      checked={form.data.roles.includes(r.id)}
                      onCheckedChange={(v) => toggleId("roles", r.id, !!v)}
                    />
                    <span className="text-sm">{r.name}</span>
                  </label>
                ))}
              </div>

              {form.errors.roles && <p className="text-sm text-destructive">{form.errors.roles}</p>}
            </CardContent>
          </Card>

          {/* Right: direct permissions grouped */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Direct permissions</CardTitle>
                <Badge variant="secondary">{form.data.permissions.length} selected</Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Estos permisos se asignan directo al usuario (extras). Los permisos por roles se calculan aparte.
              </CardContent>
            </Card>

            {groups.map((g) => (
              <Card key={g.key}>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-base">{g.title}</CardTitle>
                  <Badge variant="outline">
                    {g.items.filter((p) => form.data.permissions.includes(p.id)).length}/{g.items.length}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    {g.items.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 rounded-md border p-2">
                        <Checkbox
                          checked={form.data.permissions.includes(p.id)}
                          onCheckedChange={(v) => toggleId("permissions", p.id, !!v)}
                        />
                        <span className="text-sm">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {form.errors.permissions && <p className="text-sm text-destructive">{form.errors.permissions}</p>}
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
