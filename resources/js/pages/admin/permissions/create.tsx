"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, useForm } from "@inertiajs/react"
import { type BreadcrumbItem } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type Role = { id: number; name: string }

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Permissions", href: "/admin/roles/permissions" },
  { title: "Create", href: "/admin/roles/permissions/create" },
]

export default function Create({ roles }: { roles: Role[] }) {
  const form = useForm({
    name: "",
    roles: [] as number[],
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post("/admin/roles/permissions")
  }

  const toggle = (id: number, checked: boolean) => {
    form.setData(
      "roles",
      checked ? Array.from(new Set([...form.data.roles, id])) : form.data.roles.filter((x) => x !== id)
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Permissions | Create" />

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">Create permission</h1>
            <p className="text-sm text-muted-foreground">Name and roles.</p>
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
              {form.processing ? "Saving..." : "Create"}
            </Button>

            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
