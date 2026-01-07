"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, router, usePage } from "@inertiajs/react"
import * as React from "react"
import { toast } from "sonner"

import type { BreadcrumbItem } from "@/types"
import { InertiaPagination } from "@/components/data-table/inertia-pagination"

import { FileFolder, FileItem, Paginated, ResourceCollection } from "./types"
import { FolderTree } from "./partials/folder-tree"
import { NewFolderDialog } from "./partials/new-folder-dialog"
import { RenameFolderDialog } from "@/components/rename-folder-dialog"
import { FileUploader } from "./partials/file-uploader"
import { FileList } from "./partials/file-list"
import { FileViewer } from "./partials/file-viewer"
import { PreviewDialog } from "./partials/preview-dialog"
import { FileEditDialog } from "./partials/file-edit-dialog"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Files", href: "/files" }]
const NO_FOLDER_ID = 0

type PageProps = {
  folders: ResourceCollection<FileFolder> | FileFolder[]
  files: ResourceCollection<FileItem> | Paginated<FileItem> | FileItem[]
  filters?: { search?: string | null; folder_id?: string | null }
}

function toArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value?.data && Array.isArray(value.data)) return value.data as T[]
  return []
}

function isPaginated<T>(value: any): value is Paginated<T> {
  return !!value?.meta && typeof value.meta?.current_page === "number"
}

export default function FilesPage(props: PageProps) {
  const { auth } = usePage().props as any
  const currentUserId = auth?.user?.id

  const foldersArray = React.useMemo(() => toArray<FileFolder>(props.folders), [props.folders])
  const filesArray = React.useMemo(() => toArray<FileItem>(props.files), [props.files])

  const paginatedFiles = isPaginated<FileItem>(props.files) ? props.files : null
  const shouldShowPagination = !!paginatedFiles && (paginatedFiles.meta?.last_page ?? 1) > 1

  const [activeFolderId, setActiveFolderId] = React.useState<number | null>(null)
  const [noFolderOnly, setNoFolderOnly] = React.useState(false)

  const [activeFileId, setActiveFileId] = React.useState<number | null>(null)

  const activeFile = React.useMemo(
    () => filesArray.find((f) => f.id === activeFileId) ?? null,
    [filesArray, activeFileId]
  )

  const visibleFiles = React.useMemo(() => {
    if (noFolderOnly) return filesArray.filter((f) => f.folder_id == null)
    if (activeFolderId != null) return filesArray.filter((f) => f.folder_id === activeFolderId)
    return filesArray
  }, [filesArray, activeFolderId, noFolderOnly])

  // modal new folder
  const [newFolderOpen, setNewFolderOpen] = React.useState(false)
  const [newFolderParentId, setNewFolderParentId] = React.useState<number | null>(null)

  const [renameFolderDialog, setRenameFolderDialog] = React.useState<{
    open: boolean
    folderId: number | null
    initialName: string
  }>({ open: false, folderId: null, initialName: "" })

  const handleRenameFolder = (id: number, newName: string) => {
    router.put(route('files.folders.update', id), {
      name: newName,
    }, {
      onSuccess: () => setRenameFolderDialog(p => ({ ...p, open: false }))
    })
  }

  // preview modal
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [previewFileId, setPreviewFileId] = React.useState<number | null>(null)

  const previewUrl = (id: number) => `/files/${id}/preview`

  const previewFile = React.useMemo(
    () => filesArray.find((f) => f.id === previewFileId) ?? null,
    [filesArray, previewFileId]
  )

  const [editOpen, setEditOpen] = React.useState(false)
  const [editFileId, setEditFileId] = React.useState<number | null>(null)
  const [editSaving, setEditSaving] = React.useState(false)

  const editFile = React.useMemo(
    () => filesArray.find((f) => f.id === editFileId) ?? null,
    [filesArray, editFileId]
  )

  const onEdit = (id: number) => {
    setEditFileId(id)
    setEditOpen(true)
  }

  const onSaveEdit = (payload: { title: string; folder_id: number | null }) => {
    if (!editFile) return

    setEditSaving(true)
    router.put(`/files/${editFile.id}`, payload, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("File updated.")
        setEditOpen(false)
      },
      onError: () => toast.error("Could not update file."),
      onFinish: () => setEditSaving(false),
    })
  }

  const refresh = React.useCallback((folderId: number | null) => {
    router.get(
      "/files",
      { folder_id: folderId },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ["files", "filters"],
      }
    )
  }, [])

  const onSelectFolder = (folderId: number | null) => {
    if (folderId === NO_FOLDER_ID) {
      setNoFolderOnly(true)
      setActiveFolderId(null)
      setActiveFileId(null)
      refresh(null)
      return
    }

    setNoFolderOnly(false)
    setActiveFolderId(folderId)
    setActiveFileId(null)
    refresh(folderId)
  }

  const onNewFolder = (parentId: number | null) => {
    setNewFolderParentId(parentId)
    setNewFolderOpen(true)
  }

  const createFolder = (name: string, parentId: number | null) => {
    router.post(
      "/files/folders",
      { name, parent_id: parentId },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Folder created."),
        onError: () => toast.error("Could not create folder."),
      }
    )
  }

  const deleteFolder = (folderId: number, folderName: string) => {
    if (!confirm(`Delete folder "${folderName}" (#${folderId})?`)) return

    router.delete(`/files/folders/${folderId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Folder deleted.")
        if (activeFolderId === folderId) {
          setActiveFolderId(null)
          setNoFolderOnly(false)
          refresh(null)
        }
      },
      onError: () => toast.error("Could not delete folder."),
    })
  }

  const onUpload = (file: File, title: string | null) => {
    const fd = new FormData()
    fd.append("file", file)
    if (title) fd.append("title", title)

    const folderId = noFolderOnly ? null : activeFolderId
    if (folderId != null) fd.append("folder_id", String(folderId))

    router.post("/files", fd, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success("File uploaded."),
      onError: () => toast.error("Upload failed."),
    })
  }

  const onDeleteFile = (id: number) => {
    if (!confirm(`Delete file #${id}?`)) return

    router.delete(`/files/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("File deleted.")
        if (activeFileId === id) setActiveFileId(null)
        if (previewFileId === id) {
          setPreviewOpen(false)
          setPreviewFileId(null)
        }
      },
      onError: () => toast.error("Could not delete file."),
    })
  }

  const onBulkDeleteFiles = (ids: number[]) => {
    if (!confirm(`Delete ${ids.length} file(s)?`)) return

    router.delete("/files/bulk", {
      data: { ids },
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Files deleted.")
        setActiveFileId(null)
        if (previewFileId && ids.includes(previewFileId)) {
          setPreviewOpen(false)
          setPreviewFileId(null)
        }
      },
      onError: () => toast.error("Could not delete files."),
    })
  }

  const onDownload = (id: number) => {
    window.location.href = `/files/${id}/download`
  }

  const onPreview = (id: number) => {
    setActiveFileId(id) // también lo selecciona en el panel derecho
    setPreviewFileId(id)
    setPreviewOpen(true)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Files" />

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Files</h1>
            <p className="text-sm text-muted-foreground">Personal storage (user #{currentUserId})</p>
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
            <FileUploader onUpload={onUpload} />

            <FileList
              files={visibleFiles}
              activeFileId={activeFileId}
              onSelect={(id) => setActiveFileId(id)}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={onDeleteFile}
              onBulkDelete={onBulkDeleteFiles}
            />

            {shouldShowPagination && paginatedFiles && (
              <InertiaPagination
                metaLinks={paginatedFiles.meta.links}
                prevUrl={paginatedFiles.links.prev}
                nextUrl={paginatedFiles.links.next}
              />
            )}
          </div>

          {/* right */}
          <div className="col-span-12 lg:col-span-5">
            <div className="rounded-md border p-4">
              {activeFile ? (
                <FileViewer
                  file={activeFile}
                  src={previewUrl(activeFile.id)}
                  onDownload={() => onDownload(activeFile.id)}
                  onEdit={() => onEdit(activeFile.id)}
                  mode="panel"
                />
              ) : (
                <div className="text-sm text-muted-foreground">Select a file to preview.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview */}
      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        file={previewFile}
        src={previewFile ? previewUrl(previewFile.id) : null}
        onDownload={() => (previewFile ? onDownload(previewFile.id) : null)}
      />

      <FileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        file={editFile}
        folders={foldersArray}
        onSave={onSaveEdit}
        saving={editSaving}
      />
    </AppLayout>
  )
}
