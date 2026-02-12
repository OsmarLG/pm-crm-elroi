"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { NoteEditor } from "./partials/note-editor"
import { BreadcrumbItem } from "@/types"
import { Note, NoteFolder as Folder, ResourceCollection } from "./types"

type PageProps = {
    note: { data: Note }
    folders: ResourceCollection<Folder>
}

export default function NoteEditPage({ note, folders }: PageProps) {
    const n = note.data
    const foldersArray = folders.data || []

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Notes", href: "/notes" },
        { title: n.title || `Note #${n.id}`, href: `/notes/${n.id}` },
        { title: "Edit", href: `/notes/${n.id}/edit` },
    ]

    const onSave = (payload: { title: string; content: string; folder_id: number | null }) => {
        router.put(`/notes/${n.id}`, payload, {
            onSuccess: () => {
                // redirect handled by controller or inertia default
            }
        })
    }

    const onCancel = () => {
        router.visit(`/notes/${n.id}`)
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editing: ${n.title}`} />
            <div className="p-4 max-w-4xl mx-auto">
                <div className="border rounded-md p-4 bg-card">
                    <NoteEditor
                        note={n}
                        folders={foldersArray}
                        folderId={n.folder_id ? Number(n.folder_id) : null}
                        onSave={onSave}
                        onCancel={onCancel}
                    />
                </div>
            </div>
        </AppLayout>
    )
}
