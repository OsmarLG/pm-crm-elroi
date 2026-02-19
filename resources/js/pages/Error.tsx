import { Head } from '@inertiajs/react';

export default function ErrorPage({ status }: { status: number }) {
    const title = {
        403: '403: Forbidden',
        404: '404: Page Not Found',
        500: '500: Server Error',
        503: '503: Service Unavailable',
    }[status] || 'Error';

    const description = {
        403: 'Sorry, you are not authorized to access this page.',
        404: 'Sorry, the page you are looking for could not be found.',
        500: 'Whoops, something went wrong on our servers.',
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
    }[status] || 'An unexpected error occurred.';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
            <Head title={title} />
            <div className="w-full max-w-md space-y-8 text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                    <h1 className="text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-white">{status}</h1>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-200">{title.split(':')[1] || title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{description}</p>
                </div>
                
                <div className="pt-4">
                    <a 
                        href="/dashboard" 
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Go to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
