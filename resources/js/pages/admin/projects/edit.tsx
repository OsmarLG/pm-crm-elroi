"use client"

import { Head, Link, useForm } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

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
    start_date: string | null
    due_date: string | null
}

type Props = {
    project: Project
    customers: Customer[]
}

export default function ProjectEdit({ project, customers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: project.name || "",
        customer_id: project.customer_id.toString(),
        description: project.description || "",
        status: project.status || "pending",
        start_date: project.start_date ? project.start_date.split('T')[0] : "",
        due_date: project.due_date ? project.due_date.split('T')[0] : "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route("admin.projects.update", project.id), {
            onSuccess: () => toast.success("Project updated successfully"),
            onError: () => toast.error("Failed to update project"),
        })
    }

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Projects", href: route("admin.projects.index") },
        { title: "Edit", href: route("admin.projects.edit", project.id) },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Project" />
            <div className="p-4 w-full mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route("admin.projects.index")}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h2 className="text-xl font-bold tracking-tight">Edit Project</h2>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route("admin.tasks.index", { project_id: project.id })}>
                            Manage Tasks
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="name">Project Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                                placeholder="New Website Redesign"
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_id">Customer</Label>
                                            <Select
                                                value={data.customer_id}
                                                onValueChange={(value) => setData("customer_id", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_id && <p className="text-sm text-destructive">{errors.customer_id}</p>}
                                        </div>

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
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData("description", e.target.value)}
                                                placeholder="Project details..."
                                                rows={4}
                                                className="resize-none"
                                            />
                                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
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

                                    <div className="flex justify-end gap-4 pt-4 border-t">
                                        <Button variant="outline" asChild>
                                            <Link href={route("admin.projects.index")}>Cancel</Link>
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Project
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Manage tasks for this project in the Kanban board.
                                </p>
                                <Button asChild className="w-full">
                                    <Link href={route("admin.tasks.index", { project_id: project.id })}>
                                        Go to Project Tasks
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
