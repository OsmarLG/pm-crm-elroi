"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, Link, router, usePage } from "@inertiajs/react"
import * as React from "react"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save, X, MoreVertical, ChevronDown, User, Calendar, Info, FileDown, Sparkles, Wand2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"

dayjs.extend(localizedFormat)
import axios from "axios"
import { toast } from "sonner"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const [refactoring, setRefactoring] = React.useState(false)

  const handleRefactor = async (mode: 'refactor' | 'improve') => {
    if (!content) return
    setRefactoring(true)
    try {
      // @ts-ignore
      const res = await axios.post(route('notes.ai.refactor'), { content, mode })
      if (res.data?.title) setTitle(res.data.title)
      if (res.data?.content) setContent(res.data.content)
      toast.success(mode === 'refactor' ? 'Note refactored!' : 'Note refined & improved!')
    } catch (e) {
      toast.error("AI Refactor failed.")
      console.error(e)
    } finally {
      setRefactoring(false)
    }
  }

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
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold truncate leading-tight">
                {isEditing ? "Editing note" : n?.title || `Note #${n?.id}`}
              </h1>

              {/* Mobile Actions Toolbar (Visible only on small screens) */}
              <div className="flex md:hidden items-center gap-2 mt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/notes">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Link>
                </Button>

                <div className="flex-1" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && !isEditing && (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Note
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <a href={`/notes/${n.id}/pdf`} target="_blank" rel="noopener noreferrer">
                        <FileDown className="h-4 w-4 mr-2 text-red-500" />
                        Download PDF
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Collapsible Metadata */}
              <div className="mt-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                      <Info className="h-3 w-3 mr-1" />
                      <span className="text-sm">details</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm text-muted-foreground border-l-2 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      <span>
                        <span className="font-medium text-foreground">Owner:</span> {note.data.author_name}
                        <span className="text-xs ml-1">(#{note.data.user_id})</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        <span className="font-medium text-foreground">Last updated:</span> {dayjs(n?.updated_at).format('LLLL')}
                      </span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            {/* Desktop Actions (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/notes">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>

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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRefactor('refactor')}
                    disabled={refactoring || saving || !content}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    <Wand2 className={`h-4 w-4 mr-2 ${refactoring ? 'animate-spin' : ''}`} />
                    Refactor
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRefactor('improve')}
                    disabled={refactoring || saving || !content}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Sparkles className={`h-4 w-4 mr-2 ${refactoring ? 'animate-spin' : ''}`} />
                    Improve
                  </Button>

                  <div className="w-px h-6 bg-border mx-1" />

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

            {/* Edit Mode Buttons for Mobile (when isEditing is true) */}
            {canEdit && isEditing && (
              <div className="md:hidden flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={onCancelEdit} disabled={saving}>
                  <X className="h-5 w-5" />
                </Button>
                <Button size="icon" onClick={onSave} disabled={saving || !title.trim() || !hasChanges}>
                  <Save className="h-5 w-5" />
                </Button>
              </div>
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
