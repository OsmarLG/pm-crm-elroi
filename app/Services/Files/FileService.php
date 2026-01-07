<?php

namespace App\Services\Files;

use App\Models\FileFolder;
use App\Models\FileItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileService
{
    public function folderTree()
    {
        $userId = auth()->id();

        $all = FileFolder::query()
            ->where('user_id', $userId)
            ->orderBy('name')
            ->get(['id', 'user_id', 'parent_id', 'name']);

        $byParent = [];
        foreach ($all as $f) {
            $byParent[$f->parent_id ?? 0][] = $f;
        }

        $build = function ($parentId) use (&$build, $byParent) {
            $children = $byParent[$parentId] ?? [];
            return collect($children)->map(function ($folder) use (&$build) {
                $folder->setRelation('children', $build($folder->id));
                return $folder;
            });
        };

        return $build(0);
    }

    public function paginateFiles(array $filters): LengthAwarePaginator
    {
        $userId = auth()->id();

        $search = $filters['search'] ?? null;
        $folderId = $filters['folder_id'] ?? null; // '' | 'null' | number
        $perPage = (int) ($filters['per_page'] ?? 12);

        $q = FileItem::query()
            ->where('user_id', $userId)
            ->with(['folder:id,name,parent_id'])
            ->latest();

        if (array_key_exists('folder_id', $filters)) {
            if ($folderId === 'null') {
                $q->whereNull('folder_id');
            } elseif ($folderId !== null && $folderId !== '') {
                $q->where('folder_id', (int) $folderId);
            }
        }

        if ($search) {
            $q->where(function ($qq) use ($search) {
                $qq->where('title', 'like', "%{$search}%")
                    ->orWhere('original_name', 'like', "%{$search}%");
            });
        }

        return $q->paginate($perPage)->withQueryString();
    }

    public function createFolder(array $data): FileFolder
    {
        if (!empty($data['parent_id'])) {
            $this->ensureFolderBelongsToUser((int) $data['parent_id']);
        }

        return FileFolder::create([
            'user_id' => auth()->id(),
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
        ]);
    }

    public function updateFolder(FileFolder $folder, array $data): FileFolder
    {
        $this->assertFolderOwner($folder);

        if (!empty($data['parent_id'])) {
            $this->ensureFolderBelongsToUser((int) $data['parent_id']);
        }

        $folder->update([
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
        ]);

        return $folder;
    }

    public function deleteFolder(FileFolder $folder): void
    {
        $this->assertFolderOwner($folder);
        $folder->delete(); // files quedan folder_id null por nullOnDelete
    }

    public function storeFile(UploadedFile $upload, array $data): FileItem
    {
        $folderId = $data['folder_id'] ?? null;

        if (!empty($folderId)) {
            $this->ensureFolderBelongsToUser((int) $folderId);
        }

        $disk = 'public';
        $path = $upload->store('user-files/' . auth()->id(), $disk);

        return FileItem::create([
            'user_id' => auth()->id(),
            'folder_id' => $folderId ?: null,
            'title' => $data['title'] ?? pathinfo($upload->getClientOriginalName(), PATHINFO_FILENAME),
            'original_name' => $upload->getClientOriginalName(),
            'disk' => $disk,
            'path' => $path,
            'mime_type' => $upload->getClientMimeType(),
            'size' => $upload->getSize() ?: 0,
        ]);
    }

    public function updateFile(FileItem $file, array $data): FileItem
    {
        $this->assertFileOwner($file);

        if (array_key_exists('folder_id', $data) && $data['folder_id']) {
            FileFolder::query()
                ->where('id', (int)$data['folder_id'])
                ->where('user_id', auth()->id())
                ->firstOrFail();
        }

        $file->update([
            'title' => $data['title'],
            'folder_id' => $data['folder_id'] ?? null,
            'visibility' => $data['visibility'] ?? $file->visibility,
        ]);

        return $file;
    }

    public function download(FileItem $file): StreamedResponse
    {
        $disk = Storage::disk($file->disk);
        abort_unless($disk->exists($file->path), 404);

        return $disk->download($file->path, $file->original_name);
    }

    public function preview(FileItem $file)
    {
        $diskName = $file->disk;
        $disk = Storage::disk($diskName);
        abort_unless($disk->exists($file->path), 404);

        // ✅ Si es local/public: usa ruta real para que el servidor maneje Range mejor
        if (in_array($diskName, ['public', 'local'], true)) {
            $absolutePath = $disk->path($file->path);
            abort_unless(is_file($absolutePath), 404);

            return response()->file($absolutePath, [
                'Content-Disposition' => 'inline; filename="' . addslashes($file->original_name) . '"',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        }

        // 🔁 fallback stream (sirve para s3 pero no siempre con Range)
        $stream = $disk->readStream($file->path);
        abort_unless($stream, 404);

        $mime = $file->mime_type ?: 'application/octet-stream';

        return response()->stream(function () use ($stream) {
            fpassthru($stream);
            if (is_resource($stream)) fclose($stream);
        }, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . addslashes($file->original_name) . '"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function readText(\App\Models\FileItem $file)
    {
        $disk = Storage::disk($file->disk);
        abort_unless($disk->exists($file->path), 404);

        $mime = $file->mime_type ?: '';
        $allowed = [
            'text/plain',
            'text/csv',
            'application/json',
            'application/xml',
            'text/xml',
        ];

        // también permite por extensión si tu detector de mime falla
        $ext = strtolower(pathinfo($file->original_name, PATHINFO_EXTENSION));
        $allowedExt = ['txt', 'log', 'md', 'csv', 'json', 'xml'];

        abort_unless(in_array($mime, $allowed, true) || in_array($ext, $allowedExt, true), 415);

        // limite para evitar reventar memoria
        $maxBytes = 1024 * 400; // 400KB
        $content = $disk->get($file->path);
        if (strlen($content) > $maxBytes) {
            $content = substr($content, 0, $maxBytes) . "\n\n--- TRUNCATED ---";
        }

        return response()->json([
            'content' => $content,
            'truncated' => strlen($disk->get($file->path)) > $maxBytes,
            'mime_type' => $mime,
        ]);
    }

    public function deleteFile(FileItem $file): void
    {
        $this->assertFileOwner($file);

        $disk = Storage::disk($file->disk);
        if ($disk->exists($file->path)) {
            $disk->delete($file->path);
        }

        $file->delete();
    }

    public function bulkDeleteFiles(array $ids): void
    {
        $userId = auth()->id();

        $files = FileItem::query()
            ->where('user_id', $userId)
            ->whereIn('id', $ids)
            ->get();

        foreach ($files as $file) {
            $this->deleteFile($file);
        }
    }

    public function assertFolderOwner(FileFolder $folder): void
    {
        abort_unless($folder->user_id === auth()->id(), 403);
    }

    public function assertFileOwner(FileItem $file): void
    {
        abort_unless($file->user_id === auth()->id(), 403);
    }

    private function ensureFolderBelongsToUser(int $folderId): void
    {
        FileFolder::query()
            ->where('id', $folderId)
            ->where('user_id', auth()->id())
            ->firstOrFail();
    }
}
