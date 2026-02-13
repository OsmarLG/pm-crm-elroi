"use client"

import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, X, Mail } from "lucide-react"
import { toast } from "sonner"

// @ts-ignore
const route = window.route;

type Invitation = {
    id: number
    project: {
        id: number
        name: string
    }
    inviter: {
        id: number
        name: string
    }
    role: string
    status: string
    created_at: string
}

type Props = {
    invitations: Invitation[]
}

export default function InvitationsIndex({ invitations }: Props) {
    const handleAccept = (invitationId: number) => {
        router.post(route('admin.invitations.accept', invitationId), {}, {
            onSuccess: () => toast.success("Invitation accepted"),
            onError: () => toast.error("Failed to accept invitation")
        })
    }

    const handleReject = (invitationId: number) => {
        if (confirm("Are you sure you want to reject this invitation?")) {
            router.post(route('admin.invitations.reject', invitationId), {}, {
                onSuccess: () => toast.success("Invitation rejected"),
                onError: () => toast.error("Failed to reject invitation")
            })
        }
    }

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Invitations", href: route("admin.invitations.index") },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Invitations" />
            <div className="p-4 w-full mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">My Invitations</h2>
                </div>

                {invitations.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <Mail className="h-10 w-10 mb-2 opacity-20" />
                            <p>No pending invitations.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {invitations.map((invitation) => (
                            <Card key={invitation.id}>
                                <CardHeader>
                                    <CardTitle>{invitation.project.name}</CardTitle>
                                    <CardDescription>Invited by {invitation.inviter.name}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-sm">
                                            <p><span className="font-medium">Role:</span> <span className="capitalize">{invitation.role}</span></p>
                                            <p><span className="font-medium">Sent:</span> {new Date(invitation.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleAccept(invitation.id)}
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                                                onClick={() => handleReject(invitation.id)}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
