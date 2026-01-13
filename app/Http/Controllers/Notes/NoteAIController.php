<?php

namespace App\Http\Controllers\Notes;

use App\Http\Controllers\Controller;
use App\Services\PrismService;
use Illuminate\Http\Request;

class NoteAIController extends Controller
{
    public function __construct(protected PrismService $prismService)
    {
    }

    public function refactor(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'mode' => 'required|in:refactor,improve',
        ]);

        try {
            $result = $this->prismService->refactorNote(
                $request->input('content'),
                $request->input('mode')
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to process note AI request.'], 500);
        }
    }
}
