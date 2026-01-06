"use client"

import * as React from "react"
import AppLayout from "@/layouts/app-layout"
import { type BreadcrumbItem } from "@/types"
import { Head, router, useForm, Link } from "@inertiajs/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type Role = { id: number; name: string }

type PermissionDTO = {
  id: number
  name: string
  roles: Role[]
}

export default function Edit({ permission, roles }: { permission: PermissionDTO; roles: Role[] }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Permissions", href: "/admin/roles/permissions" },
    { title: `#${permission.id}`, href: `/admin/roles/permissions/${permission.id}` },
    { title: "Edit", href: `/admin/roles/permissions/${permission.id}/edit` },
  ]

  const form = useForm({
    name: permission.name ?? "",
    roles: (permission.roles ?? []).map((r) => r.id),
  })

  const toggle = (id: number, checked: boolean) => {
    form.setData(
      "roles",
      checked ? Array.from(new Set([...form.data.roles, id])) : form.data.roles.filter((x) => x !== id)
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    form.put(`/admin/roles/permissions/${permission.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Permission updated successfully."),
      onError: () => toast.error("Failed to update permission."),
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Permissions | Edit #${permission.id}`} />

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">Edit permission</h1>
            <p className="text-sm text-muted-foreground">Update name and roles.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/roles/permissions/${permission.id}`}>
              <Button variant="outline">View</Button>
            </Link>
            <Link href="/admin/roles/permissions">
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.data.name}
              onChange={(e) => form.setData("name", e.target.value)}
              placeholder="users.view"
            />
            {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label>Assign roles</Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 rounded-md border p-2">
                  <Checkbox
                    checked={form.data.roles.includes(r.id)}
                    onCheckedChange={(v) => toggle(r.id, Boolean(v))}
                  />
                  <span className="text-sm">{r.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={form.processing}>
              {form.processing ? "Saving..." : "Save changes"}
            </Button>

            <Button type="button" variant="outline" onClick={() => router.visit(`/admin/roles/permissions/${permission.id}`)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
