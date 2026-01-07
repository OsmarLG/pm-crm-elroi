<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    require __DIR__ . '/admin.php';
    require __DIR__ . '/notes.php';
    require __DIR__ . '/files.php';
});

require __DIR__ . '/settings.php';

Route::get('/n/{uuid}', [\App\Http\Controllers\Public\PublicNoteController::class, 'show'])->name('public.note.show');
Route::get('/f/{uuid}', [\App\Http\Controllers\Public\PublicFileController::class, 'show'])->name('public.file.show');
Route::get('/f/{uuid}/download', [\App\Http\Controllers\Public\PublicFileController::class, 'download'])->name('public.file.download');
Route::get('/f/{uuid}/content', [\App\Http\Controllers\Public\PublicFileController::class, 'content'])->name('public.file.content');

