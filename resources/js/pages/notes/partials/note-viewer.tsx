"use client"

import * as React from "react"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Maximize2, MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
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
            <div className="flex items-center gap-2">
                <NoteFullscreenDialog
                    title={note.title}
                    content={note.content ?? ""}
                    mode="view"
                    isDark={isDark}
                >
                    <Button variant="ghost" size="icon" title="Fullscreen">
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </NoteFullscreenDialog>

                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                            <Link href={`/notes/${note.id}`} className="cursor-pointer flex items-center w-full">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Page
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => {
                            import('@inertiajs/react').then(({ router }) => {
                                router.put(`/notes/${note.id}`, {
                                    title: note.title,
                                    content: note.content,
                                    folder_id: note.folder_id,
                                    visibility: note.visibility === 'public' ? 'private' : 'public'
                                }, { preserveScroll: true })
                            })
                        }}>
                            {note.visibility === 'public' ? 'Make Private' : 'Make Public'}
                        </DropdownMenuItem>


                        {note.visibility === 'public' && Boolean(note.uuid) && (
                            <DropdownMenuItem onClick={() => {
                                const url = `${window.location.origin}/n/${note.uuid}`
                                navigator.clipboard.writeText(url)
                                toast.success('Public link copied to clipboard')
                            }}>
                                Copy Public Link
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
