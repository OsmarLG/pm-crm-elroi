"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ChevronDown, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SortState = false | "asc" | "desc"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // server-side sort
  sorting: SortingState
  onSortingChange: (next: SortingState) => void

  // columnas ordenables (por accessorKey / column.id)
  sortableColumns?: string[]

  // bulk selection (ids)
  onSelectionChange?: (ids: number[]) => void

  // opcional: si tu dataset no usa "id" o quieres un id distinto
  getRowId?: (row: TData) => string
}

function SortIcon({ state }: { state: SortState }) {
  if (state === "asc") return <ArrowUp className="ml-2 h-4 w-4" />
  if (state === "desc") return <ArrowDown className="ml-2 h-4 w-4" />
  return <ChevronsUpDown className="ml-2 h-4 w-4" />
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting,
  onSortingChange,
  sortableColumns = [],
  onSelectionChange,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    // important: manual sorting (server-side)
    manualSorting: true,
    onSortingChange,

    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },

    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    // optional
    getRowId: getRowId as any,
  })

  // 🔥 Emit selected IDs for bulk actions
  React.useEffect(() => {
    if (!onSelectionChange) return

    const ids = table
      .getSelectedRowModel()
      .rows
      .map((r) => (r.original as any)?.id)
      .filter((v) => typeof v === "number") as number[]

    onSelectionChange(ids)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  const isSortable = (colId: string) => sortableColumns.includes(colId)

  const toggleSort = (colId: string, current: SortState) => {
    // ciclo: asc <-> desc (si no hay, arranca en desc como lo tenías)
    const next =
      current === "desc"
        ? [{ id: colId, desc: false }] // asc
        : [{ id: colId, desc: true }] // desc (cuando está asc o none)

    onSortingChange(next)
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(Boolean(value))
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  if (header.isPlaceholder) return <TableHead key={header.id} />

                  const colId = header.column.id
                  const canSort = isSortable(colId)
                  const sorted = header.column.getIsSorted() as SortState

                  return (
                    <TableHead key={header.id}>
                      {canSort ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className={[
                            "-ml-3 h-8 px-2",
                            sorted ? "text-foreground" : "text-muted-foreground",
                          ].join(" ")}
                          onClick={() => toggleSort(colId, sorted)}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <SortIcon state={sorted} />
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
