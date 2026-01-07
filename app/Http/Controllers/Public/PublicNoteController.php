<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicNoteController extends Controller
{
    public function show(string $uuid)
    {
        $note = Note::where('uuid', $uuid)
            ->where('visibility', 'public')
            ->with('owner:id,name') // Only expose owner name
            ->firstOrFail();

        return Inertia::render('public/note', [
            'note' => $note,
        ]);
    }
}
