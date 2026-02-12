<?php

namespace App\Http\Controllers\Notes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notes\NoteStoreRequest;
use App\Http\Requests\Notes\NoteUpdateRequest;
use App\Http\Resources\Notes\FolderResource;
use App\Http\Resources\Notes\NoteResource;
use App\Models\Note;
use App\Services\Notes\NotesService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class NoteController extends Controller
{
    public function __construct(protected NotesService $service)
    {
    }

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->query('search'),
            'folder_id' => $request->query('folder_id'),
            'per_page' => $request->query('per_page', 10),
        ];

        $folders = $this->service->folderTree();
        $notes = $this->service->paginateNotes($filters);

        return Inertia::render('notes/index', [
            'folders' => FolderResource::collection($folders),
            'notes' => NoteResource::collection($notes),
            'filters' => [
                'search' => $filters['search'],
                'folder_id' => $filters['folder_id'],
            ],
        ]);
    }

    public function show(Note $note)
    {
        $user = request()->user();

        return Inertia::render('notes/note', [
            'note' => new NoteResource($note),
            'canEdit' => $user?->can('notes.update', $note) && $user->id === $note->user_id,
        ]);
    }


    public function downloadPdf(Note $note)
    {
        $html = view('notes.pdf', [
            'note' => $note,
        ])->render();

        return Pdf::loadHTML($html)
            ->setPaper('a4')
            ->download(
                Str::slug($note->title ?: 'note') . '.pdf'
            );
    }

    public function create(Request $request)
    {
        $folders = $this->service->folderTree();

        return Inertia::render('notes/create', [
            'folders' => FolderResource::collection($folders),
            'presetFolderId' => $request->query('folder_id'),
        ]);
    }

    public function edit(Note $note)
    {
        $folders = $this->service->folderTree();

        return Inertia::render('notes/edit', [
            'note' => new NoteResource($note),
            'folders' => FolderResource::collection($folders),
        ]);
    }

    public function store(NoteStoreRequest $request)
    {
        $note = $this->service->createNote($request->validated());

        return redirect()
            ->route('notes.index', ['note' => $note->id, 'folder_id' => request('folder_id')])
            ->with('success', 'Note created.');
    }

    public function update(NoteUpdateRequest $request, Note $note)
    {
        $this->service->updateNote($note, $request->validated());
        return back()->with('success', 'Saved.');
    }

    public function destroy(Note $note)
    {
        $this->service->deleteNote($note);
        return back()->with('success', 'Deleted.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:notes,id',
        ]);

        $this->service->bulkDeleteNotes($request->input('ids'));

        return back()->with('success', 'Selected notes deleted.');
    }
}
