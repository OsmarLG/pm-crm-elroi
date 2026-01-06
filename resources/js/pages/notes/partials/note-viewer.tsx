"use client"

import * as React from "react"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Maximize2 } from "lucide-react"
import type { Note } from "../types"
import { NoteFullscreenDialog } from "./note-fullscreen-dialog"
import { Link } from "@inertiajs/react"
import { ExternalLink } from "lucide-react"

import "@uiw/react-markdown-preview/markdown.css"

type Props = {
    note: Note
    onEdit: () => void
    onDelete: () => void
}

function useIsDark() {
    const [isDark, setIsDark] = React.useState(false)

    React.useEffect(() => {
        const el = document.documentElement
        const update = () => setIsDark(el.classList.contains("dark"))
        update()

        const obs = new MutationObserver(update)
        obs.observe(el, { attributes: true, attributeFilter: ["class"] })
        return () => obs.disconnect()
    }, [])

    return isDark
}

export function NoteViewer({ note, onEdit, onDelete }: Props) {
    const isDark = useIsDark()

    return (
        <div className="space-y-4">
            <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">{note.title}</h2>
                <p className="text-sm text-muted-foreground">
                    Updated: {new Date(note.updated_at).toLocaleString()}
                </p>
            </div>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    {/* ✅ Fullscreen SOLO VIEW */}
                    <NoteFullscreenDialog
                        title={note.title}
                        content={note.content ?? ""}
                        mode="view"
                        isDark={isDark}
                    >
                        <Button variant="outline" type="button">
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Fullscreen
                        </Button>
                    </NoteFullscreenDialog>

                    <Button asChild variant="outline">
                        <Link href={`/notes/${note.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                        </Link>
                    </Button>
                    
                    <Button variant="outline" type="button" onClick={onEdit}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>

                    <Button variant="destructive" type="button" onClick={onDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* ✅ Vista normal (no editor) */}
            <div
                data-color-mode={isDark ? "dark" : "light"}
                className="rounded-md border p-4 bg-background"
            >
                <MDEditor.Markdown source={note.content ?? ""} />
            </div>
        </div>
    )
}
