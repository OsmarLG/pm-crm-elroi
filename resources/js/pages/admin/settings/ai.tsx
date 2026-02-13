"use client"

import * as React from "react"
import { Head, router, useForm } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// @ts-ignore
const route = window.route;

type AiModel = {
    id: number
    name: string
    api_name: string
    is_active: boolean
    is_selected: boolean
}

type AiConfig = {
    id: number
    provider: string
    is_active: boolean
    api_key: string // masked
    meta: {
        project_id?: string
        note_refactor_prompt?: string
        note_improve_prompt?: string
    }
    models: AiModel[]
}

type Props = {
    configurations: AiConfig[]
    available_providers: string[]
}

function AddModelDialog({
    provider,
    open,
    onOpenChange,
}: {
    provider: string
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        provider: provider,
        name: "",
        api_name: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route("admin.settings.ai.models.store"), {
            onSuccess: () => {
                reset()
                onOpenChange(false)
                toast.success("Model added successfully")
            },
            onError: () => {
                toast.error("Failed to add model")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add {provider} Model</DialogTitle>
                    <DialogDescription>
                        Register a new model identifier for this provider.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. GPT-4o"
                            required
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="api_name">API Model ID</Label>
                        <Input
                            id="api_name"
                            value={data.api_name}
                            onChange={(e) => setData("api_name", e.target.value)}
                            placeholder="e.g. gpt-4o-2024-05-13"
                            required
                        />
                        {errors.api_name && <p className="text-sm text-destructive">{errors.api_name}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Model
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ProviderCard({
    provider,
    config,
    onUpdate,
}: {
    provider: string
    config?: AiConfig
    onUpdate: (data: {
        provider: string;
        api_key: string;
        is_active: boolean;
        project_id?: string;
        note_refactor_prompt?: string;
        note_improve_prompt?: string;
    }) => void
}) {
    const [apiKey, setApiKey] = React.useState(config?.api_key || "")
    const [projectId, setProjectId] = React.useState(config?.meta?.project_id || "")
    const [noteRefactorPrompt, setNoteRefactorPrompt] = React.useState(config?.meta?.note_refactor_prompt || "")
    const [noteImprovePrompt, setNoteImprovePrompt] = React.useState(config?.meta?.note_improve_prompt || "")
    const [isActive, setIsActive] = React.useState(config?.is_active || false)
    const [isEditing, setIsEditing] = React.useState(false)
    const [showAddModal, setShowAddModal] = React.useState(false)

    React.useEffect(() => {
        setIsActive(config?.is_active || false)
        if (config?.api_key) setApiKey(config.api_key === '********' ? '' : config.api_key)
        if (config?.meta?.project_id) setProjectId(config.meta.project_id)
        if (config?.meta?.note_refactor_prompt) setNoteRefactorPrompt(config.meta.note_refactor_prompt)
        if (config?.meta?.note_improve_prompt) setNoteImprovePrompt(config.meta.note_improve_prompt)
    }, [config])

    const handleSave = () => {
        onUpdate({
            provider,
            api_key: apiKey,
            is_active: isActive,
            project_id: provider === 'openai' ? projectId : undefined,
            note_refactor_prompt: noteRefactorPrompt,
            note_improve_prompt: noteImprovePrompt,
        })
        setIsEditing(false)
    }

    const handleToggleActive = (checked: boolean) => {
        setIsActive(checked)
        if (config?.id || !checked) {
            onUpdate({
                provider,
                api_key: apiKey,
                is_active: checked,
                project_id: provider === 'openai' ? projectId : undefined,
                note_refactor_prompt: noteRefactorPrompt,
                note_improve_prompt: noteImprovePrompt,
            })
        }
    }

    const handleModelUpdate = (modelId: number, data: { is_active?: boolean, is_selected?: boolean }) => {
        router.put(route("admin.settings.ai.models.update", modelId), data, {
            preserveScroll: true,
            onError: () => toast.error("Failed to update model"),
        })
    }

    const handleModelDelete = (modelId: number) => {
        if (!confirm("Are you sure you want to delete this model?")) return
        router.delete(route("admin.settings.ai.models.destroy", modelId), {
            preserveScroll: true,
            onSuccess: () => toast.success("Model deleted"),
            onError: () => toast.error("Failed to delete model"),
        })
    }

    return (
        <Card className={isActive ? "border-primary" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="capitalize flex items-center gap-2">
                        {provider}
                        {isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                    </CardTitle>
                    <CardDescription>
                        Configuration for {provider} integration.
                    </CardDescription>
                </div>
                <Switch
                    checked={isActive}
                    onCheckedChange={handleToggleActive}
                />
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Credentials Section */}
                <div className="custom-section space-y-4 border-b pb-4">
                    <h3 className="text-sm font-medium">Credentials</h3>
                    <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                            type="password"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value)
                                setIsEditing(true)
                            }}
                            placeholder={config?.api_key ? "********" : "Enter API Key"}
                        />
                    </div>
                    {provider === 'openai' && (
                        <div className="space-y-2">
                            <Label>Project ID (Optional)</Label>
                            <Input
                                value={projectId}
                                onChange={(e) => {
                                    setProjectId(e.target.value)
                                    setIsEditing(true)
                                }}
                                placeholder="proj_..."
                            />
                        </div>
                    )}
                </div>

                {/* Prompts Section */}
                <div className="custom-section space-y-4 border-b pb-4">
                    <h3 className="text-sm font-medium">Prompts</h3>

                    <div className="space-y-2">
                        <Label>Refactor Mode Prompt</Label>
                        <Textarea
                            value={noteRefactorPrompt}
                            onChange={(e) => {
                                setNoteRefactorPrompt(e.target.value)
                                setIsEditing(true)
                            }}
                            placeholder="System prompt for 'Refactor' action..."
                            rows={3}
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Used when "Refactor" is clicked. Focus on formatting and structure.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Improve Mode Prompt</Label>
                        <Textarea
                            value={noteImprovePrompt}
                            onChange={(e) => {
                                setNoteImprovePrompt(e.target.value)
                                setIsEditing(true)
                            }}
                            placeholder="System prompt for 'Improve' action..."
                            rows={3}
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Used when "Improve" is clicked. Focus on grammar, tone, and expansion.
                        </p>
                    </div>

                    {isEditing && (
                        <div className="pt-2">
                            <Button onClick={handleSave} size="sm">
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                {/* Models Section */}
                {config?.id && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Models</h3>
                            <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Model
                            </Button>
                        </div>

                        {config.models && config.models.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Display Name</TableHead>
                                            <TableHead>API ID</TableHead>
                                            <TableHead className="w-[100px]">Active</TableHead>
                                            <TableHead className="w-[100px]">Selected</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {config.models.map((model) => (
                                            <TableRow key={model.id}>
                                                <TableCell className="font-medium">{model.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs font-mono">{model.api_name}</TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={model.is_active}
                                                        onCheckedChange={(checked) => handleModelUpdate(model.id, { is_active: checked })}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border ${model.is_selected ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30 hover:border-primary/50"}`}
                                                        onClick={() => handleModelUpdate(model.id, { is_selected: true })}
                                                    >
                                                        {model.is_selected && <Check className="h-3 w-3" />}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                        onClick={() => handleModelDelete(model.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                                No models configured. Add one to get started.
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <AddModelDialog
                provider={provider}
                open={showAddModal}
                onOpenChange={setShowAddModal}
            />
        </Card>
    )
}

export default function AiSettingsPage({ configurations, available_providers }: Props) {
    const handleUpdate = (data: any) => {
        router.post(route("admin.settings.ai.update"), data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Settings for ${data.provider} updated.`)
            },
            onError: () => {
                toast.error("Failed to update settings.")
            }
        })
    }

    // Convert array to map for easier access
    const configMap = React.useMemo(() => {
        const map: Record<string, AiConfig> = {}
        // @ts-ignore
        configurations.forEach((c: AiConfig) => {
            map[c.provider] = c
        })
        return map
    }, [configurations])

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Settings", href: "/admin/settings/ai" },
        { title: "AI Integration", href: "/admin/settings/ai" },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Settings" />
            <div className="p-4 max-w-5xl mx-auto space-y-6">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">AI Integration</h2>
                    <p className="text-muted-foreground">
                        Configure AI providers, models, and system prompts. Ensure you have at least one active provider and selected model.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {available_providers.map((provider) => (
                        <ProviderCard
                            key={provider}
                            provider={provider}
                            config={configMap[provider]}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}
