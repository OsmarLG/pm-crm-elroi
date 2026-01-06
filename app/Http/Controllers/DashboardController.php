<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Note;
use App\Models\Folder;
use App\Models\FileItem;
use App\Models\FileFolder;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();

        // ✅ Admin: stats globales (roles/permisos/users)
        // ✅ User: stats personales (notes/files/folders/storage)
        $isAdmin = $user?->hasAnyRole(['admin', 'master']) || $user?->can('users.view') || $user?->can('roles.view');

        $now = Carbon::now();
        $from7 = $now->copy()->subDays(6)->startOfDay(); // incluye hoy => 7 días

        // Helpers para series (últimos 7 días)
        $days = collect(range(0, 6))->map(function ($i) use ($from7) {
            $d = $from7->copy()->addDays($i);
            return [
                'date' => $d->format('Y-m-d'),
                'label' => $d->format('D'),
            ];
        });

        // ---------------------------------------------------------
        // Notes
        // ---------------------------------------------------------
        $notesQuery = Note::query();
        $foldersQuery = Folder::query();

        if (!$isAdmin) {
            $notesQuery->where('user_id', $user->id);
            $foldersQuery->where('user_id', $user->id);
        }

        $notesCount = (clone $notesQuery)->count();
        $noteFoldersCount = (clone $foldersQuery)->count();

        $notesLast7 = (clone $notesQuery)
            ->where('created_at', '>=', $from7)
            ->selectRaw("DATE(created_at) as d, COUNT(*) as c")
            ->groupBy('d')
            ->pluck('c', 'd');

        $notesSeries = $days->map(fn ($x) => [
            'label' => $x['label'],
            'value' => (int) ($notesLast7[$x['date']] ?? 0),
        ])->values();

        $recentNotes = (clone $notesQuery)
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'created_at', 'updated_at']);

        // ---------------------------------------------------------
        // Files
        // ---------------------------------------------------------
        $filesQuery = FileItem::query();
        $fileFoldersQuery = FileFolder::query();

        if (!$isAdmin) {
            $filesQuery->where('user_id', $user->id);
            $fileFoldersQuery->where('user_id', $user->id);
        }

        $filesCount = (clone $filesQuery)->count();
        $fileFoldersCount = (clone $fileFoldersQuery)->count();

        $storageBytes = (int) (clone $filesQuery)->sum('size');

        $filesLast7 = (clone $filesQuery)
            ->where('created_at', '>=', $from7)
            ->selectRaw("DATE(created_at) as d, COUNT(*) as c")
            ->groupBy('d')
            ->pluck('c', 'd');

        $filesSeries = $days->map(fn ($x) => [
            'label' => $x['label'],
            'value' => (int) ($filesLast7[$x['date']] ?? 0),
        ])->values();

        $recentFiles = (clone $filesQuery)
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'original_name', 'mime_type', 'size', 'created_at']);

        // Top mimes (simple)
        $topMimes = (clone $filesQuery)
            ->selectRaw('COALESCE(mime_type, "unknown") as mime, COUNT(*) as c')
            ->groupBy('mime')
            ->orderByDesc('c')
            ->limit(5)
            ->get()
            ->map(fn ($r) => ['mime' => $r->mime, 'count' => (int) $r->c]);

        // ---------------------------------------------------------
        // Admin-only: users/roles/perms
        // ---------------------------------------------------------
        $usersCount = $isAdmin ? User::query()->count() : null;
        $rolesCount = $isAdmin ? Role::query()->count() : null;
        $permissionsCount = $isAdmin ? Permission::query()->count() : null;

        return Inertia::render('dashboard', [
            'isAdmin' => $isAdmin,

            'stats' => [
                'users' => $usersCount,
                'roles' => $rolesCount,
                'permissions' => $permissionsCount,

                'notes' => $notesCount,
                'note_folders' => $noteFoldersCount,

                'files' => $filesCount,
                'file_folders' => $fileFoldersCount,
                'storage_bytes' => $storageBytes,
            ],

            'series' => [
                'notes_last_7d' => $notesSeries,
                'files_last_7d' => $filesSeries,
            ],

            'recent' => [
                'notes' => $recentNotes,
                'files' => $recentFiles,
            ],

            'top' => [
                'mimes' => $topMimes,
            ],
        ]);
    }
}
