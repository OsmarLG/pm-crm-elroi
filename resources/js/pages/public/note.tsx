import { Head } from '@inertiajs/react';
import React from 'react';
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/markdown.css";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function useIsDark() {
    const [isDark, setIsDark] = React.useState(false)

    React.useEffect(() => {
        const el = document.documentElement
        const update = () => setIsDark(el.classList.contains("dark"))
        update()

        const obs = new MutationObserver(update)
        obs.observe(el, { attributes: true, attributeFilter: ["class"] })
        return () => obs.disconnect()
    }, [])

    return isDark
}

export default function PublicNote({ note }: { note: any }) {
    const isDark = useIsDark();

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-50 selection:bg-orange-500 selection:text-white">
            <Head title={note.title} />

            <div className="max-w-3xl mx-auto px-6 py-12">
                <header className="mb-8 border-b pb-6 dark:border-neutral-800">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{note.title}</h1>
                    <div className="flex items-center text-sm text-neutral-500 gap-4">
                        <span>By {note.owner.name}</span>
                        <span>&bull;</span>
                        <span>{dayjs(note.updated_at).fromNow()}</span>
                    </div>
                </header>

                <article className="prose dark:prose-invert max-w-none">
                    <div data-color-mode={isDark ? "dark" : "light"}>
                        <MDEditor.Markdown
                            source={note.content || ""}
                            style={{ background: 'transparent' }}
                        />
                    </div>
                </article>
            </div>

            <footer className="py-8 text-center text-sm text-neutral-400">
                <p>Shared via our App</p>
            </footer>
        </div>
    );
}
