"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, router, usePage } from "@inertiajs/react"
import * as React from "react"
import { toast } from "sonner"

import type { BreadcrumbItem } from "@/types"
import { FolderTree } from "./partials/folder-tree"
import { NoteList } from "./partials/note-list"
import { NoteEditor } from "./partials/note-editor"
import { NewFolderDialog } from "./partials/new-folder-dialog"
import { RenameFolderDialog } from "@/components/rename-folder-dialog"
import { NoteViewer } from "./partials/note-viewer"
import { InertiaPagination } from "@/components/data-table/inertia-pagination"
import { NoteFolder as Folder, Note, ResourceCollection, Paginated } from "./types"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Notes", href: "/notes" }]

// 👇 Sentinel UI: “No folder”
const NO_FOLDER_ID = 0

type PageProps = {
  folders: ResourceCollection<Folder> | Folder[]
  notes: ResourceCollection<Note> | Paginated<Note> | Note[]
  activeFolderId?: number | null
  activeNote?: Note | null
}

type Mode = "view" | "edit" | "create"

function toArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value?.data && Array.isArray(value.data)) return value.data as T[]
  return []
}

function isPaginated<T>(value: any): value is Paginated<T> {
  return !!value?.meta && typeof value.meta?.current_page === "number"
}

export default function NotesPage(props: PageProps) {
  const { auth } = usePage().props as any
  const currentUserId = auth?.user?.id

  const foldersArray = React.useMemo(() => toArray<Folder>(props.folders), [props.folders])
  const notesArray = React.useMemo(() => toArray<Note>(props.notes), [props.notes])

  const paginatedNotes = isPaginated<Note>(props.notes) ? props.notes : null
  const shouldShowPagination = !!paginatedNotes && (paginatedNotes.meta?.last_page ?? 1) > 1

  const [activeFolderId, setActiveFolderId] = React.useState<number | null>(
    props.activeFolderId ?? null
  )
  const [noFolderOnly, setNoFolderOnly] = React.useState<boolean>(false)

  const [activeNoteId, setActiveNoteId] = React.useState<number | null>(
    props.activeNote?.id ?? null
  )

  const activeNote = React.useMemo(() => {
    return notesArray.find((n) => n.id === activeNoteId) ?? null
  }, [notesArray, activeNoteId])

  const visibleNotes = React.useMemo(() => {
    // ✅ “No folder” = folder_id null
    if (noFolderOnly) return notesArray.filter((n) => n.folder_id == null)

    // ✅ Folder real seleccionado
    if (activeFolderId != null) return notesArray.filter((n) => n.folder_id === activeFolderId)

    // ✅ All notes
    return notesArray
  }, [notesArray, activeFolderId, noFolderOnly])

  const [mode, setMode] = React.useState<Mode>(() => "view")
  const [saving, setSaving] = React.useState(false)

  // modal new folder
  const [newFolderOpen, setNewFolderOpen] = React.useState(false)
  const [newFolderParentId, setNewFolderParentId] = React.useState<number | null>(null)

  const [renameFolderDialog, setRenameFolderDialog] = React.useState<{
    open: boolean
    folderId: number | null
    initialName: string
  }>({ open: false, folderId: null, initialName: "" })

  const handleRenameFolder = (id: number, newName: string) => {
    router.put(route('notes.folders.update', id), {
      name: newName,
    }, {
      onSuccess: () => setRenameFolderDialog(p => ({ ...p, open: false }))
    })
  }

  const refresh = React.useCallback((folderId: number | null) => {
    router.get(
      "/notes",
      { folder_id: folderId },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        // ✅ solo actualiza lo necesario, mantiene folders como estaban
        only: ["notes", "activeFolderId", "activeNote"],
      }
    )
  }, [])

  const onSelectFolder = (folderId: number | null) => {
    // ✅ Si eliges “No folder” (0) => refresca ALL y filtra localmente
    if (folderId === NO_FOLDER_ID) {
      setNoFolderOnly(true)
      setActiveFolderId(null)
      setActiveNoteId(null)
      setMode("view")
      refresh(null)
      return
    }

    setNoFolderOnly(false)
    setActiveFolderId(folderId)
    setActiveNoteId(null)
    setMode("view")
    refresh(folderId)
  }

  const onNewFolder = (parentId: number | null) => {
    setNewFolderParentId(parentId)
    setNewFolderOpen(true)
  }

  const createFolder = (name: string, parentId: number | null) => {
    router.post(
      "/notes/folders",
      { name, parent_id: parentId },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Folder created."),
        onError: () => toast.error("Could not create folder."),
      }
    )
  }

  const deleteFolder = (folderId: number, folderName: string) => {
    if (!confirm(`Delete folder "${folderName}" (#${folderId})? (Must be empty)`)) return

    router.delete(`/notes/folders/${folderId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Folder deleted.")
        if (activeFolderId === folderId) {
          setActiveFolderId(null)
          setNoFolderOnly(false)
          refresh(null)
        }
      },
      onError: () => toast.error("Could not delete folder (maybe has notes/subfolders)."),
    })
  }

  const onCreateNote = () => {
    setActiveNoteId(null)
    setMode("create")
  }

  const onSelectNote = (id: number) => {
    setActiveNoteId(id)
    setMode("view")
  }

  const onEditNote = (id: number) => {
    setActiveNoteId(id)
    setMode("edit")
  }

  const onSaveNote = (payload: { title: string; content: string; folder_id: number | null }) => {
    setSaving(true)

    if (mode === "edit" && activeNote) {
      router.put(`/notes/${activeNote.id}`, payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Note updated.")
          setMode("view")
        },
        onError: () => toast.error("Could not update note."),
        onFinish: () => setSaving(false),
      })
      return
    }

    router.post("/notes", payload, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Note created.")
        setMode("view")
      },
      onError: () => toast.error("Could not create note."),
      onFinish: () => setSaving(false),
    })
  }

  const onDeleteNote = (id: number) => {
    if (!confirm(`Delete note #${id}?`)) return

    router.delete(`/notes/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Note deleted.")
        if (activeNoteId === id) {
          setActiveNoteId(null)
          setMode("view")
        }
      },
      onError: () => toast.error("Could not delete note."),
    })
  }

  const onBulkDeleteNotes = (ids: number[]) => {
    if (!confirm(`Delete ${ids.length} note(s)?`)) return

    router.delete("/notes/bulk", {
      data: { ids },
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Notes deleted.")
        setActiveNoteId(null)
        setMode("view")
      },
      onError: () => toast.error("Could not delete notes."),
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notes" />

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Notes</h1>
            <p className="text-sm text-muted-foreground">
              Personal notebook (user #{currentUserId})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* left */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <FolderTree
              folders={foldersArray}
              activeFolderId={noFolderOnly ? NO_FOLDER_ID : activeFolderId}
              onSelect={onSelectFolder}
              onNewFolder={onNewFolder}
              onRenameFolder={(id, name) => {
                setRenameFolderDialog({ open: true, folderId: id, initialName: name })
              }}
              onDeleteFolder={deleteFolder}
              noFolderId={NO_FOLDER_ID}
            />

            <NewFolderDialog
              open={newFolderOpen}
              setOpen={setNewFolderOpen}
              parentId={newFolderParentId}
              onCreate={createFolder}
            />

            <RenameFolderDialog
              open={renameFolderDialog.open}
              onOpenChange={(open) =>
                setRenameFolderDialog((p) => ({ ...p, open }))
              }
              folderId={renameFolderDialog.folderId}
              initialName={renameFolderDialog.initialName}
              onRename={handleRenameFolder}
            />
          </div>

          {/* middle */}
          <div className="col-span-12 md:col-span-8 lg:col-span-4 space-y-3">
            <NoteList
              notes={visibleNotes}
              folders={foldersArray}
              activeNoteId={activeNoteId}
              onSelect={onSelectNote}
              onEdit={onEditNote}
              onCreate={onCreateNote}
              onDelete={onDeleteNote}
              onBulkDelete={onBulkDeleteNotes}
            />

            {shouldShowPagination && paginatedNotes && (
              <InertiaPagination
                metaLinks={paginatedNotes.meta.links}
                prevUrl={paginatedNotes.links.prev}
                nextUrl={paginatedNotes.links.next}
              />
            )}
          </div>

          {/* right */}
          <div className="col-span-12 lg:col-span-5">
            <div className="rounded-md border p-4">
              {mode === "create" ? (
                <NoteEditor
                  note={null}
                  folders={foldersArray}
                  // si estás parado en “No folder” => null
                  folderId={noFolderOnly ? null : activeFolderId}
                  onSave={onSaveNote}
                  onCancel={() => setMode("view")}
                  saving={saving}
                />
              ) : mode === "edit" ? (
                <NoteEditor
                  note={activeNote}
                  folders={foldersArray}
                  // si editas, que respete la carpeta de la nota
                  folderId={activeNote?.folder_id ?? (noFolderOnly ? null : activeFolderId)}
                  onSave={onSaveNote}
                  onCancel={() => setMode("view")}
                  saving={saving}
                />
              ) : activeNote ? (
                <NoteViewer
                  note={activeNote}
                  onEdit={() => setMode("edit")}
                  onDelete={() => onDeleteNote(activeNote.id)}
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a note to view, or create a new one.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
