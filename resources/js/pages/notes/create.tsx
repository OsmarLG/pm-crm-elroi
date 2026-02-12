"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react"
import { NoteEditor } from "./partials/note-editor"
import { BreadcrumbItem } from "@/types"
import { NoteFolder as Folder, ResourceCollection } from "./types"

type PageProps = {
    folders: ResourceCollection<Folder>
    presetFolderId?: string
}

export default function NoteCreatePage({ folders, presetFolderId }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Notes", href: "/notes" },
        { title: "New Note", href: "/notes/create" },
    ]

    const foldersArray = folders.data || []

    const onSave = (payload: { title: string; content: string; folder_id: number | null }) => {
        router.post("/notes", payload, {
            onSuccess: () => {
                // Redirect is handled by controller/router usually, but ensure we go to index or show
            },
        })
    }

    const onCancel = () => {
        router.visit("/notes")
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Note" />
            <div className="w-full min-h-[calc(100vh-4rem)] bg-background text-foreground">
                <div className="p-4 md:p-6">
                    <NoteEditor
                        note={null}
                        folders={foldersArray}
                        folderId={presetFolderId ? Number(presetFolderId) : null}
                        onSave={onSave}
                        onCancel={onCancel}
                    />
                </div>
            </div>
        </AppLayout>
    )
}
