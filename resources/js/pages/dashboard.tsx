"use client"

import AppLayout from "@/layouts/app-layout"
import { dashboard } from "@/routes"
import type { BreadcrumbItem } from "@/types"
import { Head, Link } from "@inertiajs/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  ShieldCheck,
  KeyRound,
  NotebookText,
  Folder,
  Files as FilesIcon,
  HardDrive,
  ArrowRight,
} from "lucide-react"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Dashboard", href: dashboard().url }]

type SeriesPoint = { label: string; value: number }

type Props = {
  isAdmin: boolean
  stats: {
    users: number | null
    roles: number | null
    permissions: number | null
    notes: number
    note_folders: number
    files: number
    file_folders: number
    storage_bytes: number
  }
  series: {
    notes_last_7d: SeriesPoint[]
    files_last_7d: SeriesPoint[]
  }
  recent: {
    notes: Array<{ id: number; title: string; created_at: string; updated_at: string }>
    files: Array<{ id: number; title: string; original_name: string; mime_type: string | null; size: number; created_at: string }>
  }
  top: {
    mimes: Array<{ mime: string; count: number }>
  }
}

function formatBytes(bytes: number): string {
  const b = Number(bytes || 0)
  if (b < 1024) return `${b} B`
  const kb = b / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(2)} GB`
}

function MiniBars({ data }: { data: SeriesPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex items-end gap-2 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-4 rounded-sm bg-foreground/70"
            style={{ height: `${Math.max(4, (d.value / max) * 64)}px` }}
            title={`${d.label}: ${d.value}`}
          />
          <div className="text-[10px] text-muted-foreground">{d.label}</div>
        </div>
      ))}
    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  hint,
  href,
}: {
  icon: any
  title: string
  value: React.ReactNode
  hint?: string
  href?: string
}) {
  const content = (
    <Card className={cn(href && "hover:border-foreground/20 transition")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 opacity-80" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
      </CardContent>
    </Card>
  )

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}

export default function Dashboard(props: Props) {
  const { isAdmin, stats, series, recent, top } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="p-4 space-y-4">
        {/* TOP STATS */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {isAdmin && (
            <>
              <StatCard icon={Users} title="Users" value={stats.users ?? 0} href="/admin/users" />
              <StatCard icon={ShieldCheck} title="Roles" value={stats.roles ?? 0} href="/admin/roles" />
              <StatCard icon={KeyRound} title="Permissions" value={stats.permissions ?? 0} href="/admin/permissions" />
            </>
          )}

          <StatCard
            icon={NotebookText}
            title="Notes"
            value={stats.notes}
            hint={`${stats.note_folders} folders`}
            href="/notes"
          />

          <StatCard
            icon={FilesIcon}
            title="Files"
            value={stats.files}
            hint={`${stats.file_folders} folders`}
            href="/files"
          />

          <StatCard
            icon={HardDrive}
            title="Storage"
            value={formatBytes(stats.storage_bytes)}
            hint="Total stored files"
            href="/files"
          />
        </div>

        {/* ANALYTICS */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Notes created (last 7 days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MiniBars data={series.notes_last_7d} />
              <Separator />
              <div className="text-xs text-muted-foreground">
                Total last 7d:{" "}
                <span className="text-foreground">
                  {series.notes_last_7d.reduce((a, b) => a + b.value, 0)}
                </span>
              </div>
              <div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/notes" className="flex items-center gap-2">
                    Go to Notes <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Files uploaded (last 7 days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MiniBars data={series.files_last_7d} />
              <Separator />
              <div className="text-xs text-muted-foreground">
                Total last 7d:{" "}
                <span className="text-foreground">
                  {series.files_last_7d.reduce((a, b) => a + b.value, 0)}
                </span>
              </div>
              <div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/files" className="flex items-center gap-2">
                    Go to Files <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {/* recent notes */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <NotebookText className="h-4 w-4" /> Latest notes
                </div>

                {recent.notes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No notes yet.</div>
                ) : (
                  <div className="space-y-2">
                    {recent.notes.map((n) => (
                      <Link
                        key={n.id}
                        href={`/notes?note=${n.id}`}
                        className="block rounded-md border p-2 hover:bg-accent/40 transition"
                      >
                        <div className="truncate font-medium">{n.title || `Note #${n.id}`}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Updated: {new Date(n.updated_at).toLocaleString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* recent files */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <FilesIcon className="h-4 w-4" /> Latest files
                </div>

                {recent.files.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No files yet.</div>
                ) : (
                  <div className="space-y-2">
                    {recent.files.map((f) => (
                      <Link
                        key={f.id}
                        href={`/files?file=${f.id}`}
                        className="block rounded-md border p-2 hover:bg-accent/40 transition"
                      >
                        <div className="truncate font-medium">{f.title || `File #${f.id}`}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {f.mime_type ?? "unknown"} • {formatBytes(f.size)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* top mimes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top file types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {top.mimes.length === 0 ? (
                <div className="text-sm text-muted-foreground">No data.</div>
              ) : (
                top.mimes.map((x, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border px-2 py-1.5">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{x.mime}</div>
                    </div>
                    <div className="text-sm font-semibold">{x.count}</div>
                  </div>
                ))
              )}

              <Separator />

              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Notes folders: <span className="text-foreground">{stats.note_folders}</span> • File folders:{" "}
                <span className="text-foreground">{stats.file_folders}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
