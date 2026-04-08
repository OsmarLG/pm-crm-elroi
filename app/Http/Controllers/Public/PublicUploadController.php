<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\FileItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicUploadController extends Controller
{
    /**
     * Store a publicly uploaded file.
     * 
     * This endpoint is unauthenticated and returns a public URL.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'nullable|file|max:10240', // 10MB max
            'file' => 'nullable|file|max:10240',
        ]);

        $upload = $request->file('image') ?: $request->file('file');

        if (!$upload) {
            return response()->json(['error' => 'No file uploaded. Please use the "image" or "file" field.'], 400);
        }

        // We need a user_id for the FileItem model. 
        // We'll use the first administrator or just the first user.
        $user = User::first(); 
        
        if (!$user) {
            return response()->json(['error' => 'System error: No users found to associate the file with.'], 500);
        }

        $disk = 'public';
        $path = $upload->store('public-uploads', $disk);

        $fileItem = FileItem::create([
            'user_id' => $user->id,
            'title' => pathinfo($upload->getClientOriginalName(), PATHINFO_FILENAME),
            'original_name' => $upload->getClientOriginalName(),
            'disk' => $disk,
            'path' => $path,
            'mime_type' => $upload->getClientMimeType(),
            'size' => $upload->getSize() ?: 0,
            'visibility' => 'public',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully.',
            'data' => [
                'id' => $fileItem->id,
                'uuid' => $fileItem->uuid,
                'original_name' => $fileItem->original_name,
                'public_url' => route('public.file.show', $fileItem->uuid),
                'download_url' => route('public.file.download', $fileItem->uuid),
            ]
        ], 201);
    }
}
