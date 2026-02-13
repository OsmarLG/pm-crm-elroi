"use client"

import { Head, Link, useForm } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

// @ts-ignore
const route = window.route;

export default function CustomerCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        address: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route("admin.customers.store"), {
            onSuccess: () => toast.success("Customer created successfully"),
            onError: () => toast.error("Failed to create customer"),
        })
    }

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Customers", href: route("admin.customers.index") },
        { title: "Create", href: route("admin.customers.create") },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />
            <div className="p-4 w-full mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route("admin.customers.index")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-xl font-bold tracking-tight">Create Customer</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Company or Contact Name"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="contact@example.com"
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData("phone", e.target.value)}
                                        placeholder="+1 234 567 890"
                                    />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        placeholder="Full address..."
                                        rows={3}
                                    />
                                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button variant="outline" asChild>
                                    <Link href={route("admin.customers.index")}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Customer
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
