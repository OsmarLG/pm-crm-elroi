import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, MoreHorizontal, Pencil, Trash, Eye, AlignLeft, CheckCircle, AlertCircle, Clock } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import MDEditor from "@uiw/react-md-editor"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { useAppearance } from "@/hooks/use-appearance"

import { Task } from "./index"

type Props = {
    task: Task
    user_role: string
    onEdit: (task: Task) => void
    onDelete: (taskId: number) => void
}

export function TaskCard({ task, user_role, onEdit, onDelete }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: task.id,
        disabled: user_role === 'member'
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const { appearance } = useAppearance()
    const isDark = appearance === 'dark' || (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    const [isViewOpen, setIsViewOpen] = useState(false)

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
        }
    }

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
    const isCompletedLate = task.completed_at && task.due_date && new Date(task.completed_at) > new Date(task.due_date);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            <Card className={`cursor-move hover:shadow-md transition-shadow bg-card text-card-foreground group relative border-border ${user_role === 'member' ? 'cursor-default' : ''}`}>
                <div
                    className="absolute top-2 right-2 z-10"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                setIsViewOpen(true)
                            }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                onEdit(task)
                            }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            {user_role !== 'member' && (
                                <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(task.id)
                                }}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* View Details Modal */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {task.title}
                                <Badge variant="outline" className={`ml-2 capitalize ${getPriorityColor(task.priority)}`}>
                                    {task.priority || 'medium'}
                                </Badge>
                                {task.status === 'done' && (
                                    <Badge variant="outline" className="ml-2 border-green-500 text-green-500 gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Completed
                                    </Badge>
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto min-h-0 pr-4">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Description</h4>
                                    <div className="prose dark:prose-invert max-w-none text-sm p-3 border rounded-md bg-muted/30" data-color-mode={isDark ? 'dark' : 'light'}>
                                        <MDEditor.Markdown source={task.description || "No description provided."} style={{ backgroundColor: 'transparent' }} />
                                    </div>
                                </div>

                                {task.result_explanation && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Result Explanation</h4>
                                            <div className="prose dark:prose-invert max-w-none text-sm p-3 border rounded-md bg-muted/30" data-color-mode={isDark ? 'dark' : 'light'}>
                                                <MDEditor.Markdown source={task.result_explanation} style={{ backgroundColor: 'transparent' }} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-wrap gap-4 pt-4 text-sm text-muted-foreground">
                                    {task.assignee && (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>Assigned to: <span className="text-foreground font-medium">{task.assignee.name}</span></span>
                                        </div>
                                    )}
                                    {task.start_date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Start: <span className="text-foreground font-medium">{new Date(task.start_date).toLocaleDateString()}</span></span>
                                        </div>
                                    )}
                                    {task.due_date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Due: <span className="text-foreground font-medium">{new Date(task.due_date).toLocaleDateString()}</span></span>
                                        </div>
                                    )}
                                    {task.completed_at && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Completed: <span className="text-foreground font-medium">{new Date(task.completed_at).toLocaleDateString()} {new Date(task.completed_at).toLocaleTimeString()}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <CardHeader className="p-3 pb-0 mr-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-bold leading-tight">
                                {task.title}
                            </CardTitle>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 capitalize ${getPriorityColor(task.priority)}`}>
                                {task.priority || 'medium'}
                            </Badge>
                            {isOverdue && (
                                <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4 gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Overdue
                                </Badge>
                            )}
                            {task.status === 'done' && isCompletedLate && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 gap-1 border-orange-500 text-orange-500">
                                    <Clock className="h-3 w-3" />
                                    Late
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-2 space-y-2">
                    {task.description && (
                        <div className="relative">
                            <div className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap font-mono">
                                {task.description.substring(0, 150)}{task.description.length > 150 ? '...' : ''}
                            </div>
                            {task.description.length > 100 && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-[10px] mt-1 text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsViewOpen(true)
                                    }}
                                >
                                    View Full Description
                                </Button>
                            )}
                        </div>
                    )}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {task.start_date && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 gap-1 font-normal text-muted-foreground border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Badge>
                        )}
                        {task.due_date && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 gap-1 font-normal text-muted-foreground border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Badge>
                        )}
                        {task.assignee && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 gap-1 font-normal">
                                <User className="h-3 w-3" />
                                {task.assignee.name.split(' ')[0]}
                            </Badge>
                        )}
                        {task.result_explanation && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 gap-1 font-normal text-muted-foreground">
                                <AlignLeft className="h-3 w-3" />
                                Has Result
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


