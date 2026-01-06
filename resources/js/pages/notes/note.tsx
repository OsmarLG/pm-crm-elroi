"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, Link, router, usePage } from "@inertiajs/react"
import * as React from "react"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { BreadcrumbItem } from "@/types"
import type { Note } from "./types"

type NoteResource = { data: Note }

type PageProps = {
  note: NoteResource
  canEdit: boolean
}

export default function NoteShowPage({ note, canEdit }: PageProps) {
  const { auth } = usePage().props as any
  const n = note?.data

  const [colorMode, setColorMode] = React.useState<"light" | "dark">("light")

  // modo edición
  const [isEditing, setIsEditing] = React.useState(false)
  const [title, setTitle] = React.useState(n?.title ?? "")
  const [content, setContent] = React.useState(n?.content ?? "")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    const html = document.documentElement
    const sync = () => setColorMode(html.classList.contains("dark") ? "dark" : "light")
    sync()

    const obs = new MutationObserver(sync)
    obs.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  // Cuando cambie la nota (navegación), resetea estado
  React.useEffect(() => {
    setIsEditing(false)
    setTitle(n?.title ?? "")
    setContent(n?.content ?? "")
  }, [n?.id])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Notes", href: "/notes" },
    { title: n?.title || `Note #${n?.id}`, href: `/notes/${n?.id}` },
  ]

  const hasChanges = (title ?? "") !== (n?.title ?? "") || (content ?? "") !== (n?.content ?? "")

  const onCancelEdit = () => {
    setTitle(n?.title ?? "")
    setContent(n?.content ?? "")
    setIsEditing(false)
  }

  const onSave = () => {
    if (!n?.id) return
    if (!title.trim()) return

    setSaving(true)

    router.put(
      `/notes/${n.id}`,
      {
        title: title.trim(),
        content: content ?? "",
        folder_id: (n as any).folder_id ?? null, // conserva folder
      },
      {
        preserveScroll: true,
        onFinish: () => setSaving(false),
        onSuccess: () => {
          setIsEditing(false)
        },
      }
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={n?.title ? `Note: ${n.title}` : `Note #${n?.id}`} />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate">
              {isEditing ? "Editing note" : n?.title || `Note #${n?.id}`}
            </h1>

            <div className="mt-1 text-sm text-muted-foreground">
              <span>Owner: user #{auth?.user?.id} {auth?.user?.name}</span>
            </div>

            <div className="mt-1 ml-2 text-sm text-muted-foreground">
              <span>Last updated at: {n?.updated_at}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/notes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>

            {/* Acciones de edición (solo si canEdit) */}
            {canEdit && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}

            <Button asChild variant="outline" className="bg-red-800 hover:bg-red-500 text-white">
              <a href={`/notes/${n.id}/pdf`} target="_blank">
                Download PDF
              </a>
            </Button>

            {canEdit && isEditing && (
              <>
                <Button variant="outline" onClick={onCancelEdit} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>

                <Button onClick={onSave} disabled={saving || !title.trim() || !hasChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        {!isEditing ? (
          <div className="rounded-md border overflow-hidden">
            <div data-color-mode={colorMode} className="p-4">
              <MDEditor.Markdown source={n?.content || ""} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title..."
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <div data-color-mode={colorMode} className="rounded-md border overflow-hidden">
                <MDEditor value={content} onChange={(v) => setContent(v ?? "")} height={520} />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Usa #, ##, listas, **negritas**, etc.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
