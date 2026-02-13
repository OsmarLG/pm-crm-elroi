"use client"

import { useState, useEffect } from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import MDEditor from "@uiw/react-md-editor"

// @ts-ignore
const route = window.route;

type Customer = {
    id: number
    name: string
}

type Props = {
    customers: Customer[]
}

export default function ProjectCreate({ customers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        customer_id: "",
        description: "",
        confidential_info: "",
        status: "pending",
        start_date: "",
        due_date: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route("admin.projects.store"), {
            onSuccess: () => toast.success("Project created successfully"),
            onError: () => toast.error("Failed to create project"),
        })
    }

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Projects", href: route("admin.projects.index") },
        { title: "Create", href: route("admin.projects.create") },
    ]

    const [theme, setTheme] = useState<"light" | "dark">("light")

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark")
        setTheme(isDark ? "dark" : "light")

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    const isDark = document.documentElement.classList.contains("dark")
                    setTheme(isDark ? "dark" : "light")
                }
            })
        })

        observer.observe(document.documentElement, {
            attributes: true,
        })

        return () => observer.disconnect()
    }, [])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Project" />
            <div className="p-4 w-full mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route("admin.projects.index")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-xl font-bold tracking-tight">Create Project</h2>
                </div>

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
                                    <Label htmlFor="description">Description (Markdown)</Label>
                                    <div data-color-mode={theme}>
                                        <MDEditor
                                            value={data.description}
                                            onChange={(val) => setData("description", val || "")}
                                            height={200}
                                            preview="edit"
                                        />
                                    </div>
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="confidential_info">Confidential Information (Markdown) - Owner Only</Label>
                                    <div data-color-mode={theme}>
                                        <MDEditor
                                            value={data.confidential_info}
                                            onChange={(val) => setData("confidential_info", val || "")}
                                            height={200}
                                            preview="edit"
                                        />
                                    </div>
                                    {errors.confidential_info && <p className="text-sm text-destructive">{errors.confidential_info}</p>}
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
                                    Create Project
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
