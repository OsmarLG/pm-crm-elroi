import { Head } from '@inertiajs/react';
import type { Note } from '@/types'; // Assuming Note type exists or I need to define it locally if strict
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function PublicNote({ note }: { note: any }) {
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
                    {/* Assuming content is Markdown, we might need a markdown renderer. 
                         For now, just displaying as text or using dangerouslySetInnerHTML if it was HTML. 
                         User said "longText('content')". 
                         If the previous implementation used a Markdown editor, we should likely render markdown here.
                         However, without installing a new package, I'll display simple text or basic html if pre-rendered.
                         Wait, the Note model defines content as 'longText'. 
                         I'll stick to whitespace-pre-wrap for now to preserve structure. */ }
                    <div className="whitespace-pre-wrap">{note.content}</div>
                </article>
            </div>

            <footer className="py-8 text-center text-sm text-neutral-400">
                <p>Shared via our App</p>
            </footer>
        </div>
    );
}
