"use client"

import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

// @ts-ignore
const route = window.route;

type Customer = {
    id: number
    name: string
}

type Project = {
    id: number
    name: string
    description: string | null
    status: string
    customer_id: number
    customer?: Customer
    start_date: string | null
    due_date: string | null
}

type Props = {
    projects: {
        data: Project[]
        links: any[]
    }
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    in_progress: "default",
    completed: "outline", // using outline for success-ish look if needed, or default
    on_hold: "secondary",
    cancelled: "destructive",
}

export default function ProjectIndex({ projects }: Props) {
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const handleDelete = (id: number) => {
        setProjectToDelete(id)
        setIsDeleteOpen(true)
    }

    const confirmDelete = () => {
        if (!projectToDelete) return

        router.delete(route("admin.projects.destroy", projectToDelete), {
            onSuccess: () => {
                toast.success("Project deleted")
                setIsDeleteOpen(false)
                setProjectToDelete(null)
            },
            onError: () => toast.error("Failed to delete project"),
        })
    }

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Projects", href: route("admin.projects.index") },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="p-4 w-full mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Projects</h2>
                        <p className="text-muted-foreground">
                            Manage your projects and track their status.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route("admin.projects.create")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Project
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.data.length > 0 ? (
                                    projects.data.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium whitespace-nowrap">{project.name}</TableCell>
                                            <TableCell className="whitespace-nowrap">{project.customer?.name || "Unknown"}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusColors[project.status] || "default"}>
                                                    {project.status.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{project.due_date ? new Date(project.due_date).toLocaleDateString() : "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route("admin.projects.edit", project.id)}>
                                                            <FolderOpen className="h-4 w-4 mr-2" />
                                                            Open
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(project.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No projects found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Project</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete this project?</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                This action cannot be undone. All tasks and data associated with this project will be permanently deleted.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    )
}
