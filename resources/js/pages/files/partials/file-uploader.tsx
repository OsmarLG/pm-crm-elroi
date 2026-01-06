"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  onUpload: (file: File, title: string | null) => void
}

export function FileUploader({ onUpload }: Props) {
  const [file, setFile] = React.useState<File | null>(null)
  const [title, setTitle] = React.useState("")

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="text-sm font-medium">Upload</div>

      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Optional title (defaults to filename)"
      />

      <Button
        type="button"
        disabled={!file}
        onClick={() => {
          if (!file) return
          onUpload(file, title.trim() ? title.trim() : null)
          setFile(null)
          setTitle("")
        }}
      >
        Upload
      </Button>
    </div>
  )
}
