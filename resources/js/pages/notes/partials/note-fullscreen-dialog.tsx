"use client"

import * as React from "react"
import MDEditor, { getCommands, getExtraCommands } from "@uiw/react-md-editor"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { X, Save } from "lucide-react"

type Props = {
    title: string
    content: string
    mode?: "edit" | "preview"
    onSave?: (payload: { title: string; content: string }) => void
    children: React.ReactNode
}

export function NoteFullscreenDialog({
    title,
    content,
    mode = "edit",
    onSave,
    children,
}: Props) {
    const [open, setOpen] = React.useState(false)
    const [localTitle, setLocalTitle] = React.useState(title)
    const [localContent, setLocalContent] = React.useState(content)

    React.useEffect(() => setLocalTitle(title), [title])
    React.useEffect(() => setLocalContent(content), [content])

    // ✅ Bloquea scroll del body mientras está abierto
    React.useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    /** 🔥 Detecta light / dark desde <html class="dark"> */
    const [colorMode, setColorMode] = React.useState<"light" | "dark">("light")

    React.useEffect(() => {
        if (!open) return

        const html = document.documentElement
        const syncTheme = () => setColorMode(html.classList.contains("dark") ? "dark" : "light")
        syncTheme()

        const observer = new MutationObserver(syncTheme)
        observer.observe(html, { attributes: true, attributeFilter: ["class"] })
        return () => observer.disconnect()
    }, [open])

    // ✅ elimina FULLSCREEN nativo de uiw tanto en toolbar como extra toolbar
    const commands = React.useMemo(
        () => getCommands().filter((cmd) => cmd.name !== "fullscreen"),
        []
    )
    const extraCommands = React.useMemo(
        () => getExtraCommands().filter((cmd) => cmd.name !== "fullscreen"),
        []
    )

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]" />

                <DialogPrimitive.Content
                    className="
            fixed inset-0 z-[10000]
            w-screen h-screen
            bg-background
            p-0 m-0 border-0 rounded-none
            flex flex-col
          "
                >
                    {/* Header */}
                    <div className="h-14 shrink-0 px-4 border-b flex items-center justify-between">
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                                {localTitle || "Untitled"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Markdown supported
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onSave && (
                                <Button
                                    size="sm"
                                    onClick={() => onSave({ title: localTitle, content: localContent })}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="bg-background" style={{ height: 'calc(100vh - 3.5rem)' }}>
                        <div className="md-editor-notes h-full" data-color-mode={colorMode}>
                            <MDEditor
                                value={localContent}
                                onChange={(v) => setLocalContent(v ?? "")}
                                preview={mode}
                                height="100%"
                                commands={commands}
                                extraCommands={extraCommands}
                                textareaProps={{
                                    className: "font-mono",
                                }}
                            />
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}
