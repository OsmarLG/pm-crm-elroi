<?php

namespace App\Http\Controllers\Notes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notes\FolderStoreRequest;
use App\Http\Requests\Notes\FolderUpdateRequest;
use App\Models\Folder;
use App\Services\Notes\NotesService;

class FolderController extends Controller
{
    public function __construct(protected NotesService $service) {}

    public function store(FolderStoreRequest $request)
    {
        $this->service->createFolder($request->validated());
        return back()->with('success', 'Folder created.');
    }

    public function update(FolderUpdateRequest $request, Folder $folder)
    {
        $this->service->updateFolder($folder, $request->validated());
        return back()->with('success', 'Folder updated.');
    }

    public function destroy(Folder $folder)
    {
        $this->service->deleteFolder($folder);
        return back()->with('success', 'Folder deleted.');
    }
}
