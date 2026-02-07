<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use App\Http\Requests\Files\FileStoreRequest;
use App\Http\Requests\Files\FileUpdateRequest;
use App\Http\Requests\Files\BulkDestroyFilesRequest;
use App\Http\Resources\Files\FileFolderResource;
use App\Http\Resources\Files\FileResource;
use App\Models\FileItem;
use App\Services\Files\FileService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FileController extends Controller
{
    public function __construct(protected FileService $service)
    {
        ini_set('memory_limit', '-1');
    }

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->query('search'),
            'folder_id' => $request->query('folder_id'),
            'per_page' => $request->query('per_page', 12),
        ];

        $folders = $this->service->folderTree();
        $files = $this->service->paginateFiles($filters);

        return Inertia::render('files/index', [
            'folders' => FileFolderResource::collection($folders),
            'files' => FileResource::collection($files),
            'filters' => [
                'search' => $filters['search'],
                'folder_id' => $filters['folder_id'],
            ],
        ]);
    }

    public function store(FileStoreRequest $request)
    {
        $file = $this->service->storeFile(
            $request->file('file'),
            $request->validated()
        );

        return back()->with('success', 'File uploaded.');
    }

    public function update(FileUpdateRequest $request, FileItem $file)
    {
        $this->service->assertFileOwner($file);

        $updated = $this->service->updateFile($file, $request->validated());

        return back()->with('success', 'File updated.');
    }

    public function download(FileItem $file)
    {
        $this->service->assertFileOwner($file);
        return $this->service->download($file);
    }

    public function preview(FileItem $file)
    {
        $this->service->assertFileOwner($file);
        return $this->service->preview($file); // inline
    }

    public function text(\App\Models\FileItem $file)
    {
        $this->service->assertFileOwner($file);
        return $this->service->readText($file);
    }

    public function destroy(FileItem $file)
    {
        $this->service->deleteFile($file);
        return back()->with('success', 'Deleted.');
    }

    public function bulkDestroy(BulkDestroyFilesRequest $request)
    {
        $this->service->bulkDeleteFiles($request->validated()['ids']);
        return back()->with('success', 'Selected files deleted.');
    }
}
