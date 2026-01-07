import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FileIcon, DownloadIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { TextViewer } from '../files/partials/text-viewer';
import { AudioPlayer } from '../files/partials/audio-player';
import { VideoPlayer } from '../files/partials/video-player';

export default function PublicFile({ file, download_url }: { file: any, download_url: string }) {

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 p-4">
            <Head title={file.title || file.original_name} />

            <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FileIcon className="w-8 h-8" />
                </div>

                <div>
                    <h1 className="text-xl font-semibold text-neutral-900 dark:text-white break-words">
                        {file.title || file.original_name}
                    </h1>
                    <p className="text-sm text-neutral-500 mt-2">
                        Shared by {file.user?.name ?? file.owner?.name}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-neutral-400">
                        <span>{formatSize(file.size)}</span>
                        <span>&bull;</span>
                        <span>{dayjs(file.created_at).format('MMM D, YYYY')}</span>
                    </div>
                </div>

                <Button asChild className="w-full">
                    <a href={download_url} download>
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download File
                    </a>
                </Button>

                {file.mime_type?.startsWith('image/') && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                        <img src={download_url} alt={file.title} className="max-w-full h-auto mx-auto" />
                    </div>
                )}

                {/* Text/Code Preview */}
                {/* Text/Code Preview */}
                {(file.mime_type?.startsWith('text/') ||
                    ['csv', 'json', 'xml', 'txt', 'log', 'md', 'ts', 'js', 'php', 'html', 'css', 'sql', 'yml', 'yaml'].includes((file.original_name?.split('.').pop() ?? '').toLowerCase()) ||
                    file.mime_type === 'application/json' ||
                    file.mime_type === 'application/xml') ? (
                    <div className="mt-6 border rounded-lg p-4 bg-gray-50 dark:bg-black/20 text-left">
                        <TextViewer url={`/f/${file.uuid}/content`} title="Preview" />
                    </div>
                ) : null}

                {/* PDF Preview */}
                {file.mime_type === "application/pdf" && (
                    <iframe
                        src={download_url}
                        className="w-full h-[520px] rounded-md border mt-4"
                    />
                )}

                {/* Audio Preview */}
                {file.mime_type?.startsWith("audio/") && (
                    <div className="mt-4">
                        <AudioPlayer src={download_url} mime={file.mime_type} />
                    </div>
                )}

                {/* Video Preview */}
                {file.mime_type?.startsWith("video/") && (
                    <div className="mt-4">
                        <VideoPlayer src={download_url} mime={file.mime_type} />
                    </div>
                )}
            </div>
            <footer className="mt-8 text-center text-xs text-neutral-400">
                <p>Shared via our App</p>
            </footer>
        </div>
    );
}
