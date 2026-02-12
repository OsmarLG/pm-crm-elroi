"use client"

import * as React from "react"
import { Head, router } from "@inertiajs/react"
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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// @ts-ignore
const route = window.route;

type AiConfig = {
    id: number
    provider: string
    is_active: boolean
    api_key: string // masked
}

type Props = {
    configurations: AiConfig[]
    available_providers: string[]
}

function ProviderCard({
    provider,
    config,
    onUpdate,
}: {
    provider: string
    config?: AiConfig
    onUpdate: (data: { provider: string; api_key: string; is_active: boolean }) => void
}) {
    const [apiKey, setApiKey] = React.useState(config?.api_key || "")
    const [isActive, setIsActive] = React.useState(config?.is_active || false)
    const [isEditing, setIsEditing] = React.useState(false)

    React.useEffect(() => {
        setIsActive(config?.is_active || false)
        // Don't overwrite apiKey if user is typing, but validation logic might be needed
    }, [config])

    const handleSave = () => {
        onUpdate({
            provider,
            api_key: apiKey,
            is_active: isActive,
        })
        setIsEditing(false)
    }

    const handleToggleActive = (checked: boolean) => {
        setIsActive(checked)
        // Auto-save on toggle if key is present or we are deactivating
        if (config?.id || !checked) {
            onUpdate({
                provider,
                api_key: apiKey, // logic in controller handles masked key
                is_active: checked,
            })
        }
    }

    return (
        <Card className={isActive ? "border-primary" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="capitalize">{provider}</CardTitle>
                    <CardDescription>
                        {isActive ? "Active Provider" : "Inactive"}
                    </CardDescription>
                </div>
                <Switch
                    checked={isActive}
                    onCheckedChange={handleToggleActive}
                />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
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
                </div>
                {isEditing && (
                    <Button onClick={handleSave} size="sm">
                        Save changes
                    </Button>
                )}
            </CardContent>
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
    // configurations is passed as an array from controller map
    const configMap = React.useMemo(() => {
        const map: Record<string, AiConfig> = {}
        // @ts-ignore
        Object.values(configurations).forEach((c: AiConfig) => {
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
            <div className="p-4 max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">AI Integration</h2>
                    <p className="text-muted-foreground">
                        Configure API keys for AI providers. Only one provider can be active at a time.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
