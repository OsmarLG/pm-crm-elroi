import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "./task-card"
import { MoreHorizontal, Pencil, Trash2, Palette, ChevronLeft, ChevronRight } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { Task } from "./index"

type TaskStatus = {
    id: number
    name: string
    slug: string
    color: string | null
    order_column: number
    is_default: boolean
}

type Props = {
    status: TaskStatus
    tasks: Task[]
    user_role: string
    currentUserId: number
    onEdit: (task: Task) => void
    onDelete: (taskId: number) => void
    onEditColumn?: (status: TaskStatus) => void
    onDeleteColumn?: (statusId: number) => void
    onMoveLeft?: (statusId: number) => void
    onMoveRight?: (statusId: number) => void
    isFirst?: boolean
    isLast?: boolean
}

export function TaskColumn({ status, tasks, user_role, currentUserId, onEdit, onDelete, onEditColumn, onDeleteColumn, onMoveLeft, onMoveRight, isFirst, isLast }: Props) {
    const { setNodeRef } = useDroppable({
        id: status.slug,
    })

    const colorVariants: Record<string, string> = {
        gray: "bg-gray-100 text-gray-700",
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        yellow: "bg-yellow-100 text-yellow-700",
        red: "bg-red-100 text-red-700",
        purple: "bg-purple-100 text-purple-700",
    }

    const badgeColor = status.color && colorVariants[status.color] ? colorVariants[status.color] : colorVariants.gray

    return (
        <div className="flex flex-col w-80 shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-700">{status.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {user_role !== 'member' && onMoveLeft && onMoveRight && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onMoveLeft(status.id)}
                                disabled={isFirst}
                                title="Move left"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onMoveRight(status.id)}
                                disabled={isLast}
                                title="Move right"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    {user_role !== 'member' && onEditColumn && onDeleteColumn && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onEditColumn(status)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Column
                                </DropdownMenuItem>
                                {!status.is_default && (
                                    <DropdownMenuItem
                                        onClick={() => onDeleteColumn(status.id)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Column
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
            <div
                ref={setNodeRef}
                className="bg-gray-50/50 rounded-lg p-2 min-h-[500px] border-2 border-dashed border-gray-200 flex flex-col gap-3"
            >
                <SortableContext
                    id={status.slug}
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            user_role={user_role}
                            currentUserId={currentUserId}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
