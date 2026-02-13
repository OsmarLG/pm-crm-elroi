"use client"

import { Head, Link } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FolderOpen } from "lucide-react"

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
    completed: "outline",
    on_hold: "secondary",
    cancelled: "destructive",
}

export default function CollaborationsProjectsIndex({ projects }: Props) {
    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "My Projects", href: route("collaborations.projects.index") },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Projects" />
            <div className="p-4 w-full mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">My Projects</h2>
                        <p className="text-muted-foreground">
                            Projects you are collaborating on.
                        </p>
                    </div>
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
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{project.name}</span>
                                                    {project.description && (
                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {project.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{project.customer?.name || "Unknown"}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusColors[project.status] || "default"}>
                                                    {project.status.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{project.due_date ? new Date(project.due_date).toLocaleDateString() : "-"}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild>
                                                    {/* We assume admin.projects.show (or edit) is accessible to members for now, 
                                                        or we create a specific show route. 
                                                        For now let's point to admin.projects.edit as that seems to be the main view based on previous steps?
                                                        Actually admin.projects.edit is for editing. 
                                                        We might need a read-only view or limited view.
                                                        If the user has permission to edit tasks, maybe edit view is fine but with disabled project fields?
                                                        Let's assume admin.projects.edit for now and we can refine permissions later.
                                                    */}
                                                    <Link href={route("admin.projects.edit", project.id)}>
                                                        <FolderOpen className="mr-2 h-4 w-4" />
                                                        Open
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            You are not a member of any projects yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
