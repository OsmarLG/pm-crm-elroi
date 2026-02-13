import { useState } from "react"
import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, UserPlus, Mail, User as UserIcon, X } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// @ts-ignore
const route = window.route;

type User = {
    id: number
    name: string
    email: string
    pivot: {
        role: string
    }
}

type Invitation = {
    id: number
    email: string
    username: string | null
    role: string
    status: string
}

type Project = {
    id: number
    users: User[]
    invitations?: Invitation[]
}

type Props = {
    project: Project
    user_role: string
}

export default function ProjectMembersManager({ project, user_role }: Props) {
    const [inviteType, setInviteType] = useState<"email" | "username">("email")
    const [inviteValue, setInviteValue] = useState("")
    const [inviteRole, setInviteRole] = useState("member")
    const [inviteLoading, setInviteLoading] = useState(false)

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault()
        setInviteLoading(true)

        const payload: any = { role: inviteRole }
        if (inviteType === "email") {
            payload.email = inviteValue
        } else {
            payload.username = inviteValue
        }

        router.post(route('admin.projects.invitations.store', project.id), payload, {
            onSuccess: () => {
                setInviteValue("")
                setInviteRole("member")
                toast.success("Invitation sent successfully")
                setInviteLoading(false)
            },
            onError: () => {
                // toast.error("Failed to invite member") // Handled by backend validation errors automatically shown by Inertia if configured, but adding toast just in case or rely on page props errors if handling them.
                setInviteLoading(false)
            }
        })
    }

    const handleCancelInvitation = (invitationId: number) => {
        if (confirm("Cancel this invitation?")) {
            router.delete(route('admin.projects.invitations.destroy', { project: project.id, invitation: invitationId }), {
                onSuccess: () => toast.success("Invitation cancelled"),
                onError: () => toast.error("Failed to cancel invitation")
            })
        }
    }

    const handleRemoveMember = (memberId: number) => {
        if (confirm("Are you sure you want to remove this member?")) {
            router.delete(route('admin.projects.members.destroy', { project: project.id, member: memberId }), {
                onSuccess: () => toast.success("Member removed successfully"),
                onError: () => toast.error("Failed to remove member")
            })
        }
    }

    const handleUpdateRole = (memberId: number, newRole: string) => {
        router.put(route('admin.projects.members.update', { project: project.id, member: memberId }), {
            role: newRole
        }, {
            onSuccess: () => toast.success("Role updated successfully"),
            onError: () => toast.error("Failed to update role")
        })
    }

    const canManage = user_role === 'owner' || user_role === 'admin'

    return (
        <div className="space-y-6">
            {/* Invite Form */}
            {canManage && (
                <div className="space-y-4 border-b pb-4">
                    <h4 className="text-sm font-medium">Invite New Member</h4>
                    <Tabs value={inviteType} onValueChange={(v: any) => setInviteType(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="username">Username</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleInviteMember} className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="invite-value">
                                    {inviteType === 'email' ? 'Email Address' : 'Username'}
                                </Label>
                                <div className="relative">
                                    {inviteType === 'email' ? (
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Input
                                        id="invite-value"
                                        type={inviteType === 'email' ? 'email' : 'text'}
                                        placeholder={inviteType === 'email' ? 'user@example.com' : 'username'}
                                        value={inviteValue}
                                        onChange={(e) => setInviteValue(e.target.value)}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button type="submit" className="flex-1" disabled={inviteLoading}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {inviteLoading ? "Sending..." : "Invite"}
                                </Button>
                            </div>
                        </form>
                    </Tabs>
                </div>
            )}

            {/* Pending Invitations */}
            {project.invitations && project.invitations.length > 0 && (
                <div className="space-y-4 border-b pb-4">
                    <h4 className="text-sm font-medium text-orange-600">Pending Invitations</h4>
                    <div className="space-y-3">
                        {project.invitations.map((invitation) => (
                            <div key={invitation.id} className="flex items-center justify-between bg-orange-50 p-2 rounded-md border border-orange-100">
                                <div>
                                    <p className="font-medium text-sm text-orange-900">
                                        {invitation.email || invitation.username}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-orange-700">
                                        <span className="capitalize">{invitation.role}</span>
                                        <span>•</span>
                                        <span>Pending</span>
                                    </div>
                                </div>
                                {canManage && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-orange-600 hover:text-orange-900 hover:bg-orange-100"
                                        onClick={() => handleCancelInvitation(invitation.id)}
                                        title="Cancel Invitation"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium">Current Members</h4>
                <div className="space-y-3">
                    {project.users && project.users.map((member) => (
                        <div key={member.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                            <div>
                                <p className="font-medium text-sm">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={member.pivot.role}
                                    onValueChange={(val) => handleUpdateRole(member.id, val)}
                                    disabled={!canManage || member.pivot.role === 'owner'}
                                >
                                    <SelectTrigger className="h-7 text-xs w-[90px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                                {canManage && member.pivot.role !== 'owner' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        className="h-7 w-7 text-destructive hover:text-destructive/90"
                                        onClick={() => handleRemoveMember(member.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
