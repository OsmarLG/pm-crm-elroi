"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, Link, usePage } from "@inertiajs/react"
import * as React from "react"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, MoreVertical, ChevronDown, User, Calendar, Info, FileDown } from "lucide-react"
import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"

dayjs.extend(localizedFormat)

import { route } from "ziggy-js"

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

  /** 🔥 Detecta light / dark desde <html class="dark"> */
  const [colorMode, setColorMode] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    const html = document.documentElement

    const syncTheme = () => {
      setColorMode(html.classList.contains("dark") ? "dark" : "light")
    }

    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(html, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect()
  }, [])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Notes", href: "/notes" },
    { title: n?.title || `Note #${n?.id}`, href: `/notes/${n?.id}` },
  ]

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
                {n?.title || `Note #${n?.id}`}
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
                    {canEdit && (
                      <DropdownMenuItem asChild>
                        <Link href={route('notes.edit', n.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Note
                        </Link>
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

              {canEdit && (
                <Button asChild>
                  <Link href={route('notes.edit', n.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" className="bg-red-800 hover:bg-red-500 text-white">
                <a href={`/notes/${n.id}/pdf`} target="_blank">
                  Download PDF
                </a>
              </Button>


            </div>


          </div>
        </div>

        {/* Body */}
        <div className="rounded-md border overflow-hidden bg-background">
          <div data-color-mode={colorMode} className="p-4 bg-background text-foreground">
            <MDEditor.Markdown source={n?.content || ""} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
