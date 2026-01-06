"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { FileItem } from "../types"
import { FileViewer } from "./file-viewer"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  file: FileItem | null
  src: string | null
  onDownload: () => void
}

export function PreviewDialog({ open, onOpenChange, file, src, onDownload }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] w-[96vw] h-[92vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
          <div className="min-w-0">
            <DialogTitle className="truncate">
              {file?.title ?? "Preview"}
            </DialogTitle>
            {file?.original_name ? (
              <div className="text-xs text-muted-foreground truncate">{file.original_name}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 mr-6">
            <Button variant="outline" onClick={onDownload} disabled={!file}>
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="h-[calc(92vh-56px)] p-4 overflow-auto">
          {file && src ? (
            <FileViewer file={file} src={src} onDownload={onDownload} mode="modal" />
          ) : (
            <div className="text-sm text-muted-foreground">No file selected.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
