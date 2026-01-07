<?php

namespace App\Services\Notes;

use App\Models\Folder;
use App\Models\Note;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotesService
{
    public function folderTree()
    {
        $userId = auth()->id();

        $all = Folder::query()
            ->where('user_id', $userId)
            ->orderBy('name')
            ->get(['id', 'user_id', 'parent_id', 'name']);

        // build map
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

    public function paginateNotes(array $filters): LengthAwarePaginator
    {
        $userId = auth()->id();

        $search = $filters['search'] ?? null;
        $folderId = $filters['folder_id'] ?? null; // '' | 'null' | number
        $perPage = (int) ($filters['per_page'] ?? 12);

        $q = Note::query()
            ->where('user_id', $userId)
            ->with(['folder:id,name,parent_id']) // 👈 para que resource no explote
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
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $q->paginate($perPage)->withQueryString();
    }

    public function createFolder(array $data): Folder
    {
        return Folder::create([
            'user_id' => auth()->id(),
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
        ]);
    }

    public function updateFolder(Folder $folder, array $data): Folder
    {
        $this->assertFolderOwner($folder);
        $folder->update([
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
        ]);
        return $folder;
    }

    public function deleteFolder(Folder $folder): void
    {
        $this->assertFolderOwner($folder);
        $folder->delete(); // notas quedan sin carpeta por nullOnDelete
    }

    public function createNote(array $data): Note
    {
        if (!empty($data['folder_id'])) {
            $this->ensureFolderBelongsToUser((int) $data['folder_id']);
        }

        return Note::create([
            'user_id' => auth()->id(),
            'folder_id' => $data['folder_id'] ?? null,
            'title' => $data['title'],
            'content' => $data['content'] ?? '',
        ]);
    }

    public function updateNote(Note $note, array $data): Note
    {
        $this->assertNoteOwner($note);

        if (array_key_exists('folder_id', $data) && !empty($data['folder_id'])) {
            $this->ensureFolderBelongsToUser((int) $data['folder_id']);
        }

        $note->update([
            'folder_id' => $data['folder_id'] ?? null,
            'title' => $data['title'],
            'content' => $data['content'] ?? '',
            'visibility' => $data['visibility'] ?? $note->visibility, // Preserve if not sent, or nullable
        ]);

        return $note;
    }

    public function deleteNote(Note $note): void
    {
        $this->assertNoteOwner($note);
        $note->delete();
    }

    public function bulkDeleteNotes(array $ids): void
    {
        $userId = auth()->id();

        Note::query()
            ->whereIn('id', $ids)
            ->where('user_id', $userId)
            ->delete();
    }

    private function ensureFolderBelongsToUser(int $folderId): void
    {
        Folder::query()
            ->where('id', $folderId)
            ->where('user_id', auth()->id())
            ->firstOrFail();
    }

    private function assertFolderOwner(Folder $folder): void
    {
        abort_unless($folder->user_id === auth()->id(), 403);
    }

    private function assertNoteOwner(Note $note): void
    {
        abort_unless($note->user_id === auth()->id(), 403);
    }
}
