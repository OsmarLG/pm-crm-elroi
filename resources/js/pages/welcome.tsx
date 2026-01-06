import { dashboard, login, register } from "@/routes"
import { type SharedData } from "@/types"
import { Head, Link, usePage } from "@inertiajs/react"
import { ShieldCheck, NotebookText, Files, Users, KeyRound, LayoutGrid } from "lucide-react"
import AppLogo from "@/components/app-logo"

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth, name } = usePage<SharedData>().props

    return (
        <>
            <Head title={name} />

            <div className="min-h-screen bg-background">
                {/* Top bar */}
                <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl border bg-muted/40">
                            <AppLogo getName={false} className="h-6 w-6" />
                        </div>

                        <div className="leading-tight">
                            <div className="text-sm font-semibold">Project Hub</div>
                            <div className="text-xs text-muted-foreground">ELROI Labs</div>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                                    >
                                        Create account
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <main className="mx-auto w-full max-w-6xl px-6 pb-16">
                    <div className="grid items-center gap-10 lg:grid-cols-2">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Your private hub for <span className="text-primary">Notes</span>,{" "}
                                <span className="text-primary">Files</span> and{" "}
                                <span className="text-primary">Admin</span>.
                            </h1>

                            <p className="mt-4 text-muted-foreground">
                                Keep everything in one place: markdown notes, file previews, and user/role/permission
                                management powered by Spatie.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"
                                    >
                                        Open Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"
                                        >
                                            Sign in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="inline-flex items-center rounded-md border px-5 py-2.5 text-sm hover:bg-muted"
                                            >
                                                Create account
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                                <div className="rounded-lg border bg-muted/20 p-3">Inertia + React</div>
                                <div className="rounded-lg border bg-muted/20 p-3">Markdown notes</div>
                                <div className="rounded-lg border bg-muted/20 p-3">File preview</div>
                            </div>
                        </div>

                        {/* Feature cards */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Feature icon={NotebookText} title="Notes" desc="Folders, search, quick view, PDF export." />
                            <Feature icon={Files} title="Files" desc="Folders, upload, preview, organization." />
                            <Feature icon={Users} title="Users" desc="User management and verification." />
                            <Feature icon={KeyRound} title="Roles & Permissions" desc="Spatie permissions, full control." />
                            <Feature icon={ShieldCheck} title="Security" desc="Auth, policies, module-based permissions." />
                            <Feature icon={LayoutGrid} title="Dashboard" desc="Quick overview and shortcuts." />
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}

function Feature({
    icon: Icon,
    title,
    desc,
}: {
    icon: any
    title: string
    desc: string
}) {
    return (
        <div className="rounded-xl border bg-muted/10 p-4">
            <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg border bg-muted/30">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <div className="text-sm font-semibold">{title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
                </div>
            </div>
        </div>
    )
}
