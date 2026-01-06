"use client"

import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"

type MetaLink = {
  url: string | null
  label: string
  active: boolean
  page: number | null
}

export function InertiaPagination({
  metaLinks,
  prevUrl,
  nextUrl,
  className,
}: {
  metaLinks: MetaLink[]
  prevUrl: string | null
  nextUrl: string | null
  className?: string
}) {
  const go = (url: string | null) => {
    if (!url) return
    router.get(url, {}, { preserveState: true, preserveScroll: true })
  }

  const numbered = metaLinks.filter(
    (l) => !l.label.includes("Previous") && !l.label.includes("Next")
  )

  const labelText = (label: string) =>
    label
      .replace("&laquo;", "")
      .replace("&raquo;", "")
      .replace("Previous", "Prev")
      .replace("Next", "Next")
      .trim()

  return (
    <div className={className ?? "flex items-center justify-end gap-2 py-4"}>
      <Button
        variant="outline"
        size="sm"
        disabled={!prevUrl}
        onClick={() => go(prevUrl)}
      >
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {numbered.map((l, idx) => (
          <Button
            key={`${l.label}-${idx}`}
            variant={l.active ? "default" : "outline"}
            size="sm"
            disabled={!l.url}
            onClick={() => go(l.url)}
          >
            {labelText(l.label)}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={!nextUrl}
        onClick={() => go(nextUrl)}
      >
        Next
      </Button>
    </div>
  )
}
