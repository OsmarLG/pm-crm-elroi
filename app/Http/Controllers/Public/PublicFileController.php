<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\FileItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicFileController extends Controller
{
    public function show(string $uuid)
    {
        $file = FileItem::where('uuid', $uuid)
            ->where('visibility', 'public')
            ->with('user:id,name')
            ->firstOrFail();

        // For files, we might want to show a preview page, or just download/inline the file.
        // User requested: "se vean el contenido nomas... y puedas copiar el url publico"
        // For files, usually "open publicly" means viewing it in browser.

        // Let's render a public view wrapper that shows details and a "Download/View" button or iframe if possible.
        // Or strictly strictly speaking, user said: "que los files pase lo mismo, se puedan abrir publicamente"

        return Inertia::render('public/file', [
            'file' => $file,
            'download_url' => route('public.file.download', $uuid),
        ]);
    }

    public function download(string $uuid)
    {
        $file = FileItem::where('uuid', $uuid)
            ->where('visibility', 'public')
            ->firstOrFail();

        return Storage::disk($file->disk)->response($file->path, $file->original_name);
    }

    public function content(string $uuid)
    {
        $file = FileItem::where('uuid', $uuid)
            ->where('visibility', 'public')
            ->firstOrFail();

        $disk = Storage::disk($file->disk);
        abort_unless($disk->exists($file->path), 404);

        $maxBytes = 1024 * 400; // 400KB limit
        $content = $disk->get($file->path);
        
        if (strlen($content) > $maxBytes) {
            $content = substr($content, 0, $maxBytes) . "\n\n--- TRUNCATED ---";
        }

        return response()->json([
            'content' => $content,
        ]);
    }
}
