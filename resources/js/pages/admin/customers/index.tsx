"use client"

import { Head, Link, router } from "@inertiajs/react"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

// @ts-ignore
const route = window.route;

type Customer = {
    id: number
    name: string
    email: string | null
    phone: string | null
    address: string | null
    created_at: string
}

type Props = {
    customers: {
        data: Customer[]
        links: any[]
    }
}

export default function CustomerIndex({ customers }: Props) {
    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            router.delete(route("admin.customers.destroy", id), {
                onSuccess: () => toast.success("Customer deleted"),
                onError: () => toast.error("Failed to delete customer"),
            })
        }
    }

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Customers", href: route("admin.customers.index") },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="p-4 w-full mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Customers</h2>
                        <p className="text-muted-foreground">
                            Manage your customer base.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route("admin.customers.create")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.data.length > 0 ? (
                                    customers.data.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium whitespace-nowrap">{customer.name}</TableCell>
                                            <TableCell>{customer.email || "-"}</TableCell>
                                            <TableCell className="whitespace-nowrap">{customer.phone || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={route("admin.customers.edit", customer.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(customer.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No customers found.
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
