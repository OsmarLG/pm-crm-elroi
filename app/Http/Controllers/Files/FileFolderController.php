<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use App\Http\Requests\Files\FileFolderStoreRequest;
use App\Http\Requests\Files\FileFolderUpdateRequest;
use App\Models\FileFolder;
use App\Services\Files\FileService;

class FileFolderController extends Controller
{
    public function __construct(protected FileService $service) {}

    public function store(FileFolderStoreRequest $request)
    {
        $this->service->createFolder($request->validated());
        return back()->with('success', 'Folder created.');
    }

    public function update(FileFolderUpdateRequest $request, FileFolder $folder)
    {
        $this->service->updateFolder($folder, $request->validated());
        return back()->with('success', 'Folder updated.');
    }

    public function destroy(FileFolder $folder)
    {
        $this->service->deleteFolder($folder);
        return back()->with('success', 'Folder deleted.');
    }
}
