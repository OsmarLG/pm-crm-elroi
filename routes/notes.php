<?php

use App\Http\Controllers\Notes\FolderController;
use App\Http\Controllers\Notes\NoteController;
use App\Http\Controllers\Notes\NoteAIController;
use Illuminate\Support\Facades\Route;

Route::prefix('notes')->name('notes.')->group(function () {

    Route::post('/ai/refactor', [NoteAIController::class, 'refactor'])
        ->middleware('can:notes.update') // Assuming notes.update or similar permission, or maybe open for now?
        // Actually, let's use standard auth for now as per controller. But middleware in group might be missing auth?
        // web.php wraps this in ['auth', 'verified'].
        ->name('ai.refactor');

    Route::get('/', [NoteController::class, 'index'])
        ->middleware('can:notes.view')
        ->name('index');

    Route::post('/', [NoteController::class, 'store'])
        ->middleware('can:notes.create')
        ->name('store');

    // ✅ bulk antes de {note}
    Route::delete('/bulk', [NoteController::class, 'bulkDestroy'])
        ->middleware('can:notes.delete')
        ->name('bulkDestroy');

    // ✅ rutas específicas antes de /{note}
    Route::get('/{note}/pdf', [NoteController::class, 'downloadPdf'])
        ->middleware('can:notes.view')
        ->name('pdf');

    Route::put('/{note}', [NoteController::class, 'update'])
        ->middleware('can:notes.update')
        ->name('update');

    Route::delete('/{note}', [NoteController::class, 'destroy'])
        ->middleware('can:notes.delete')
        ->name('destroy');

    Route::get('/{note}', [NoteController::class, 'show'])
        ->middleware('can:notes.view')
        ->name('show');

    // Folders
    Route::post('/folders', [FolderController::class, 'store'])
        ->middleware('can:folders.manage')
        ->name('folders.store');

    Route::put('/folders/{folder}', [FolderController::class, 'update'])
        ->middleware('can:folders.manage')
        ->name('folders.update');

    Route::delete('/folders/{folder}', [FolderController::class, 'destroy'])
        ->middleware('can:folders.manage')
        ->name('folders.destroy');
});
