"use client"

import * as React from "react"
import MDEditor, { getCommands, getExtraCommands } from "@uiw/react-md-editor"

type Props = {
    value: string
    onChange: (val: string) => void
    height: number
    preview?: "edit" | "preview" | "live"
    hideToolbar?: boolean
    visibleDragbar?: boolean
    colorMode: "light" | "dark"
}

export default function MDEditorCompact({
    value,
    onChange,
    height,
    preview = "edit",
    hideToolbar,
    visibleDragbar,
    colorMode,
}: Props) {
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
        <div
            data-color-mode={colorMode}
            className="md-editor-compact rounded-md border overflow-hidden"
            style={{ height }}
        >
            <MDEditor
                value={value}
                onChange={(v) => onChange(v ?? "")}
                height={height}
                preview={preview}
                hideToolbar={hideToolbar}
                visibleDragbar={visibleDragbar}
                commands={commands}
                extraCommands={extraCommands}
                textareaProps={{ className: "font-mono" }}
            />
        </div>
    )
}
