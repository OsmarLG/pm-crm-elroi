"use client"

import { useState, useEffect } from "react"
import { Head, useForm, router, usePage } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, Users, Shield, Trash2, UserPlus } from "lucide-react"
import { Link } from "@inertiajs/react"
import MDEditorCompact from "@/components/Markdown/MDEditorCompact"

import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core"

import { arrayMove, sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskColumn } from "./task-column"
import { TaskCard } from "./task-card"
import { toast } from "sonner"

import ProjectMembersManager from "@/components/Admin/ProjectMembersManager"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { useAppearance } from "@/hooks/use-appearance"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import MDEditor from "@uiw/react-md-editor"

// @ts-ignore
const route = window.route;

export type Task = {
    id: number
    title: string
    description: string | null
    status: {
        id: number
        name: string
        slug: string
        color: string | null
    }
    priority: string
    result_explanation: string | null
    project: {
        name: string
        customer: {
            name: string
        }
    }
    assignee: {
        id: number
        name: string
    } | null
    start_date: string | null
    due_date: string | null
    completed_at: string | null
}

type Project = {
    id: number
    name: string
    customer: {
        name: string
    }
    users: {
        id: number
        name: string
        email: string
        pivot: {
            role: string
        }
    }[]
}

type TaskStatus = {
    id: number
    name: string
    slug: string
    color: string | null
    order_column: number
    is_default: boolean
}

type Props = {
    tasks: Record<string, Task[]>
    project: Project
    users: { id: number; name: string }[]
    user_role: string
    statuses: TaskStatus[]
}

export default function TaskIndex({ tasks, project, users, user_role, statuses }: Props) {
    const { appearance } = useAppearance()
    const isDark = appearance === 'dark' || (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const currentUserId = usePage<any>().props.auth.user.id

    // Ensure all columns exist in initial state
    const [items, setItems] = useState<Record<string, Task[]>>(() => {
        const initialTasks: Record<string, Task[]> = {}
        statuses.forEach(status => {
            initialTasks[status.slug] = tasks[status.slug] || []
        })
        return initialTasks
    })

    const [activeId, setActiveId] = useState<number | null>(null)
    const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
    const [isMembersOpen, setIsMembersOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState("member")

    // State for managing columns
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
    const [newColumnName, setNewColumnName] = useState("")
    const [newColumnColor, setNewColumnColor] = useState("gray") // Default color

    const handleAddColumn = (e: React.FormEvent) => {
        e.preventDefault()
        router.post(route('admin.projects.statuses.store', project.id), {
            name: newColumnName,
            color: newColumnColor
        }, {
            onSuccess: () => {
                setIsAddColumnOpen(false)
                setNewColumnName("")
                toast.success("Column added successfully")
            },
            onError: () => toast.error("Failed to add column")
        })
    }


    // Check if current user is owner or admin
    // We assume the authenticated user is in the `users` prop or we can find them in project.users
    // For now, let's rely on server-side validation or pass auth user separately if needed.
    // But we can check permissions visually.

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault()
        router.post(route('admin.projects.members.store', project.id), {
            email: inviteEmail,
            role: inviteRole
        }, {
            onSuccess: () => {
                setInviteEmail("")
                setInviteRole("member")
                toast.success("Member invited successfully")
                setIsMembersOpen(false)
            },
            onError: (errors) => {
                toast.error("Failed to invite member")
            }
        })
    }

    const handleRemoveMember = (memberId: number) => {
        if (confirm("Are you sure you want to remove this member?")) {
            router.delete(route('admin.projects.members.destroy', [project.id, memberId]), {
                onSuccess: () => toast.success("Member removed"),
                onError: () => toast.error("Failed to remove member")
            })
        }
    }

    const handleUpdateRole = (memberId: number, newRole: string) => {
        router.put(route('admin.projects.members.update', [project.id, memberId]), {
            role: newRole
        }, {
            onSuccess: () => toast.success("Role updated"),
            onError: () => toast.error("Failed to update role")
        })
    }

    useEffect(() => {
        const newItems: Record<string, Task[]> = {}
        statuses.forEach(status => {
            newItems[status.slug] = tasks[status.slug] || []
        })
        setItems(newItems)
    }, [tasks, statuses])

    // Auto-refresh every 30 seconds to keep tasks synchronized
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['tasks'] })
        }, 30000) // 30 seconds

        return () => clearInterval(interval)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const findContainer = (id: number) => {
        if (id in items) {
            return id
        }

        return Object.keys(items).find((key) =>
            items[key].find((item) => item.id === id)
        )
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        const id = active.id
        const overId = over?.id

        if (!overId || id === overId) return

        const activeContainer = findContainer(id as number)
        const overContainer = findContainer(overId as number) || overId

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return
        }

        setItems((prev) => {
            const activeItems = prev[activeContainer as string] || []
            const overItems = prev[overContainer as string] || []

            const activeIndex = activeItems.findIndex((item) => item.id === id)
            const overIndex = overItems.findIndex((item) => item.id === overId)

            let newIndex
            if (overId in prev) {
                newIndex = overItems.length + 1
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height
                const modifier = isBelowOverItem ? 1 : 0
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
            }

            return {
                ...prev,
                [activeContainer as string]: [
                    ...prev[activeContainer as string].filter((item) => item.id !== id),
                ],
                [overContainer as string]: [
                    ...prev[overContainer as string].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer as string].slice(newIndex, overItems.length),
                ],
            }
        })
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        const id = active.id
        const overId = over?.id

        const activeContainer = findContainer(id as number)
        const overContainer = findContainer(overId as number) || overId

        if (activeContainer && overContainer) {
            const activeItems = items[activeContainer as string] || []
            const overItems = items[overContainer as string] || []

            const activeIndex = activeItems.findIndex((item) => item.id === id)
            const overIndex = overItems.findIndex((item) => item.id === overId)

            let newIndex = overIndex
            if (overId && overId in items && items[overId as string]?.length === 0) {
                newIndex = 0
            } else if (overIndex < 0) {
                newIndex = overItems.length
            }

            const newStatus = overContainer as string;

            if (activeContainer === overContainer) {
                setItems((prev) => ({
                    ...prev,
                    [overContainer as string]: arrayMove(prev[overContainer as string], activeIndex, newIndex),
                }))
            } else {
                // The item was already moved in handleDragOver, but we need to ensure the backend is updated.
                // If we needed to "commit" the move here, we would do it.
            }

            // Sync with backend
            router.put(route('admin.tasks.update-status', id), {
                status: newStatus,
                order_column: newIndex,
            }, {
                preserveScroll: true,
                onSuccess: () => { },
                onError: () => toast.error('Failed to update task status')
            })

            setActiveId(null)
        }
    }

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Projects", href: route("admin.projects.index") },
        { title: project.name, href: route("admin.projects.edit", project.id) },
        { title: "Tasks", href: route("admin.tasks.index", { project_id: project.id }) },
    ]

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        result_explanation: "",
        project_id: project.id,
        assigned_to: "",
        start_date: "",
        due_date: "",
    })

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route("admin.tasks.store"), {
            onSuccess: () => {
                setIsCreateOpen(false)
                reset()
                toast.success("Task created successfully")
            },
            onError: () => toast.error("Failed to create task"),
        })
    }

    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null)

    const { data: editData, setData: setEditData, put: putEdit, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        title: "",
        description: "",
        status: "",
        priority: "medium",
        result_explanation: "",
        assigned_to: "",
        start_date: "",
        due_date: "",
    })

    const handleEdit = (task: Task) => {
        setEditingTask(task)
        setEditData({
            title: task.title,
            description: task.description || "",
            status: task.status.slug,
            priority: task.priority || "medium",
            result_explanation: task.result_explanation || "",
            assigned_to: task.assignee ? task.assignee.id.toString() : "",
            start_date: task.start_date ? task.start_date.split('T')[0] : "",
            due_date: task.due_date ? task.due_date.split('T')[0] : "",
        })
        setIsEditOpen(true)
    }

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTask) return

        putEdit(route("admin.tasks.update", editingTask.id), {
            onSuccess: () => {
                setIsEditOpen(false)
                resetEdit()
                setEditingTask(null)
                toast.success("Task updated successfully")
            },
            onError: () => toast.error("Failed to update task"),
        })
    }

    const handleDelete = (taskId: number) => {
        setTaskToDelete(taskId)
        setIsDeleteOpen(true)
    }

    const [editingColumn, setEditingColumn] = useState<TaskStatus | null>(null)
    const [isEditColumnOpen, setIsEditColumnOpen] = useState(false)
    const [editColumnName, setEditColumnName] = useState("")
    const [editColumnColor, setEditColumnColor] = useState("gray")

    const [columnToDelete, setColumnToDelete] = useState<number | null>(null)
    const [isDeleteColumnOpen, setIsDeleteColumnOpen] = useState(false)

    const handleEditColumn = (status: TaskStatus) => {
        setEditingColumn(status)
        setEditColumnName(status.name)
        setEditColumnColor(status.color || "gray")
        setIsEditColumnOpen(true)
    }

    const handleEditColumnSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingColumn) return

        router.put(route('admin.projects.statuses.update', [project.id, editingColumn.id]), {
            name: editColumnName,
            color: editColumnColor
        }, {
            onSuccess: () => {
                setIsEditColumnOpen(false)
                setEditingColumn(null)
                toast.success("Column updated successfully")
            },
            onError: () => toast.error("Failed to update column")
        })
    }

    const handleDeleteColumn = (statusId: number) => {
        setColumnToDelete(statusId)
        setIsDeleteColumnOpen(true)
    }

    const confirmDeleteColumn = () => {
        if (!columnToDelete) return

        router.delete(route('admin.projects.statuses.destroy', [project.id, columnToDelete]), {
            onSuccess: () => {
                setIsDeleteColumnOpen(false)
                setColumnToDelete(null)
                toast.success("Column deleted successfully")
            },
            onError: () => toast.error("Failed to delete column")
        })
    }

    const handleMoveColumnLeft = (statusId: number) => {
        const currentIndex = statuses.findIndex(s => s.id === statusId)
        if (currentIndex <= 0) return // Already at the start

        const newStatuses = [...statuses]
        const temp = newStatuses[currentIndex]
        newStatuses[currentIndex] = newStatuses[currentIndex - 1]
        newStatuses[currentIndex - 1] = temp

        // Update order_column for all statuses
        const updatedStatuses = newStatuses.map((status, index) => ({
            id: status.id,
            order_column: index
        }))

        router.put(route('admin.projects.statuses.reorder', project.id), {
            statuses: updatedStatuses
        }, {
            onSuccess: () => toast.success("Column moved successfully"),
            onError: () => toast.error("Failed to move column")
        })
    }

    const handleMoveColumnRight = (statusId: number) => {
        const currentIndex = statuses.findIndex(s => s.id === statusId)
        if (currentIndex >= statuses.length - 1) return // Already at the end

        const newStatuses = [...statuses]
        const temp = newStatuses[currentIndex]
        newStatuses[currentIndex] = newStatuses[currentIndex + 1]
        newStatuses[currentIndex + 1] = temp

        // Update order_column for all statuses
        const updatedStatuses = newStatuses.map((status, index) => ({
            id: status.id,
            order_column: index
        }))

        router.put(route('admin.projects.statuses.reorder', project.id), {
            statuses: updatedStatuses
        }, {
            onSuccess: () => toast.success("Column moved successfully"),
            onError: () => toast.error("Failed to move column")
        })
    }

    const confirmDelete = () => {
        if (!taskToDelete) return

        router.delete(route("admin.tasks.destroy", taskToDelete), {
            onSuccess: () => {
                setIsDeleteOpen(false)
                setTaskToDelete(null)
                toast.success("Task deleted successfully")
            },
            onError: () => toast.error("Failed to delete task"),
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tasks - ${project.name}`} />
            <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route("admin.projects.edit", project.id)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <span className="font-medium text-foreground">{project.customer?.name}</span>
                                <span>•</span>
                                <span>Task Board</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {user_role !== 'member' && (
                            <Button onClick={() => setIsMembersOpen(true)} variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Members
                            </Button>
                        )}
                        {user_role !== 'member' && (
                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Task
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
                                    <DialogHeader className="p-6 pb-2">
                                        <DialogTitle>Create New Task</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-y-auto p-6 pt-2 min-h-0">
                                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={data.title}
                                                    onChange={(e) => setData("title", e.target.value)}
                                                    placeholder="Task title"
                                                    required
                                                />
                                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select
                                                        value={data.status}
                                                        onValueChange={(value) => setData("status", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statuses.map((status) => (
                                                                <SelectItem key={status.id} value={status.slug}>
                                                                    {status.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="priority">Priority</Label>
                                                    <Select
                                                        value={data.priority}
                                                        onValueChange={(value) => setData("priority", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select priority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="low">Low</SelectItem>
                                                            <SelectItem value="medium">Medium</SelectItem>
                                                            <SelectItem value="high">High</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>

                                                <MDEditorCompact
                                                    colorMode={isDark ? "dark" : "light"}
                                                    value={data.description}
                                                    onChange={(val) => setData("description", val)}
                                                    height={200}
                                                    preview="edit"
                                                />

                                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="result_explanation">Result Explanation</Label>

                                                <MDEditorCompact
                                                    colorMode={isDark ? "dark" : "light"}
                                                    value={data.result_explanation}
                                                    onChange={(val) => setData("result_explanation", val)}
                                                    height={150}
                                                    preview="edit"
                                                />

                                                {errors.result_explanation && <p className="text-sm text-destructive">{errors.result_explanation}</p>}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="assigned_to">Assignee</Label>
                                                    <Select
                                                        value={data.assigned_to}
                                                        onValueChange={(value) => setData("assigned_to", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select assignee" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {users.map((user) => (
                                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                                    {user.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.assigned_to && <p className="text-sm text-destructive">{errors.assigned_to}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="start_date">Start Date</Label>
                                                    <Input
                                                        id="start_date"
                                                        type="date"
                                                        value={data.start_date}
                                                        onChange={(e) => setData("start_date", e.target.value)}
                                                    />
                                                    {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="due_date">Due Date</Label>
                                                    <Input
                                                        id="due_date"
                                                        type="date"
                                                        value={data.due_date}
                                                        onChange={(e) => setData("due_date", e.target.value)}
                                                    />
                                                    {errors.due_date && <p className="text-sm text-destructive">{errors.due_date}</p>}
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={processing}>
                                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Create
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 bg-background">
                            <DialogHeader className="p-6 pb-2">
                                <DialogTitle>Edit Task</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-6 pt-2 min-h-0">
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-title">Title</Label>
                                        <Input
                                            id="edit-title"
                                            value={editData.title}
                                            onChange={(e) => setEditData("title", e.target.value)}
                                            placeholder="Task title"
                                            required
                                            disabled={user_role === 'member'}
                                        />
                                        {errorsEdit.title && <p className="text-sm text-destructive">{errorsEdit.title}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-status">Status</Label>
                                            <Select
                                                value={editData.status}
                                                onValueChange={(value) => setEditData("status", value)}
                                                disabled={user_role === 'member'}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuses.map((status) => (
                                                        <SelectItem key={status.id} value={status.slug}>
                                                            {status.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errorsEdit.status && <p className="text-sm text-destructive">{errorsEdit.status}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-priority">Priority</Label>
                                            <Select
                                                value={editData.priority}
                                                onValueChange={(value) => setEditData("priority", value)}
                                                disabled={user_role === 'member'}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errorsEdit.priority && <p className="text-sm text-destructive">{errorsEdit.priority}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2" data-color-mode={isDark ? 'dark' : 'light'}>
                                        <Label htmlFor="edit-description">Description</Label>
                                        <MDEditorCompact
                                            colorMode={isDark ? "dark" : "light"}
                                            value={editData.description}
                                            onChange={(val) => setEditData("description", val)}
                                            height={200}
                                            preview={user_role === "member" ? "preview" : "edit"}
                                            hideToolbar={user_role === "member"}
                                            visibleDragbar={user_role !== "member"}
                                        />
                                        {errorsEdit.description && <p className="text-sm text-destructive">{errorsEdit.description}</p>}
                                    </div>
                                    <div className="space-y-2" data-color-mode={isDark ? 'dark' : 'light'}>
                                        <Label htmlFor="edit-result_explanation">Result Explanation</Label>
                                        <MDEditorCompact
                                            colorMode={isDark ? "dark" : "light"}
                                            value={editData.result_explanation}
                                            onChange={(val) => setEditData("result_explanation", val)}
                                            height={150}
                                            preview={
                                                user_role === "member" && editingTask?.assignee?.id !== usePage<any>().props.auth.user.id
                                                    ? "preview"
                                                    : "edit"
                                            }
                                            hideToolbar={user_role === "member" && editingTask?.assignee?.id !== usePage<any>().props.auth.user.id}
                                            visibleDragbar={!(
                                                user_role === "member" && editingTask?.assignee?.id !== usePage<any>().props.auth.user.id
                                            )}
                                        />
                                        {errorsEdit.result_explanation && <p className="text-sm text-destructive">{errorsEdit.result_explanation}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="edit-assigned_to">Assignee</Label>
                                            <Select
                                                value={editData.assigned_to}
                                                onValueChange={(value) => setEditData("assigned_to", value)}
                                                disabled={user_role === 'member'}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select assignee" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errorsEdit.assigned_to && <p className="text-sm text-destructive">{errorsEdit.assigned_to}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-start_date">Start Date</Label>
                                            <Input
                                                id="edit-start_date"
                                                type="date"
                                                value={editData.start_date}
                                                onChange={(e) => setEditData("start_date", e.target.value)}
                                                disabled={user_role === 'member'}
                                            />
                                            {errorsEdit.start_date && <p className="text-sm text-destructive">{errorsEdit.start_date}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-due_date">Due Date</Label>
                                            <Input
                                                id="edit-due_date"
                                                type="date"
                                                value={editData.due_date}
                                                onChange={(e) => setEditData("due_date", e.target.value)}
                                                disabled={user_role === 'member'}
                                            />
                                            {errorsEdit.due_date && <p className="text-sm text-destructive">{errorsEdit.due_date}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <div>
                                            {(user_role !== 'member' ||
                                                (user_role === 'member' && editingTask?.assignee?.id === usePage<any>().props.auth.user.id)) &&
                                                editData.status !== 'done' && (
                                                    <Button type="button" variant="outline" className="border-green-500 text-green-500 hover:bg-green-50" onClick={() => {
                                                        if (!editingTask) return
                                                        router.put(route("admin.tasks.update", editingTask.id), {
                                                            ...editData,
                                                            status: 'done'
                                                        }, {
                                                            onSuccess: () => {
                                                                setIsEditOpen(false)
                                                                resetEdit()
                                                                setEditingTask(null)
                                                                toast.success("Task marked as completed")
                                                            },
                                                            onError: () => toast.error("Failed to update task"),
                                                        })
                                                    }}>
                                                        Mark as Completed
                                                    </Button>
                                                )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                                Cancel
                                            </Button>
                                            {/* Only show Save if allowed to edit something */}
                                            {(user_role !== 'member' || editingTask?.assignee?.id === usePage<any>().props.auth.user.id) && (
                                                <Button type="submit" disabled={processingEdit}>
                                                    {processingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Save Changes
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
                        <DialogContent className="max-w-md bg-background">
                            <DialogHeader>
                                <DialogTitle>Project Members</DialogTitle>
                            </DialogHeader>
                            <ProjectMembersManager project={project} user_role={user_role} />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Task</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 h-full overflow-x-auto pb-4 items-start">
                        {statuses.map((status, index) => (
                            <TaskColumn
                                key={status.slug}
                                status={status}
                                tasks={items[status.slug] || []}
                                user_role={user_role}
                                currentUserId={currentUserId}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onEditColumn={handleEditColumn}
                                onDeleteColumn={handleDeleteColumn}
                                onMoveLeft={handleMoveColumnLeft}
                                onMoveRight={handleMoveColumnRight}
                                isFirst={index === 0}
                                isLast={index === statuses.length - 1}
                            />
                        ))}

                        {/* Add Column Button */}
                        {user_role !== 'member' && (
                            <div className="shrink-0 w-80">
                                <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full text-muted-foreground border-dashed h-12">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Column
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Column</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAddColumn} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="column-name">Column Name</Label>
                                                <Input
                                                    id="column-name"
                                                    value={newColumnName}
                                                    onChange={(e) => setNewColumnName(e.target.value)}
                                                    placeholder="e.g. Review, Testing"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="column-color">Color</Label>
                                                <Select value={newColumnColor} onValueChange={setNewColumnColor}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="gray">Gray</SelectItem>
                                                        <SelectItem value="blue">Blue</SelectItem>
                                                        <SelectItem value="green">Green</SelectItem>
                                                        <SelectItem value="yellow">Yellow</SelectItem>
                                                        <SelectItem value="red">Red</SelectItem>
                                                        <SelectItem value="purple">Purple</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="outline" onClick={() => setIsAddColumnOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit">
                                                    Add Column
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>
                    <DragOverlay>
                        {activeId ? <TaskCard task={Object.values(items).flat().find((t) => t.id === activeId)!} user_role={user_role} currentUserId={currentUserId} onEdit={() => { }} onDelete={() => { }} /> : null}
                    </DragOverlay>
                </DndContext>

                {/* Edit Column Dialog */}
                <Dialog open={isEditColumnOpen} onOpenChange={setIsEditColumnOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Column</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditColumnSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-column-name">Column Name</Label>
                                <Input
                                    id="edit-column-name"
                                    value={editColumnName}
                                    onChange={(e) => setEditColumnName(e.target.value)}
                                    placeholder="Column Name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-column-color">Color</Label>
                                <Select value={editColumnColor} onValueChange={setEditColumnColor}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gray">Gray</SelectItem>
                                        <SelectItem value="blue">Blue</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="yellow">Yellow</SelectItem>
                                        <SelectItem value="red">Red</SelectItem>
                                        <SelectItem value="purple">Purple</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditColumnOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Column Dialog */}
                <Dialog open={isDeleteColumnOpen} onOpenChange={setIsDeleteColumnOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Column</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete this column?</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Tasks in this column will be moved to the first available column (Backlog/Todo).
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDeleteColumnOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDeleteColumn}>
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    )
}

