<?php

use App\Http\Controllers\Files\FileController;
use App\Http\Controllers\Files\FileFolderController;
use Illuminate\Support\Facades\Route;

Route::prefix('files')->name('files.')->group(function () {

    Route::get('/', [FileController::class, 'index'])
        ->middleware('can:files.view')
        ->name('index');

    Route::post('/', [FileController::class, 'store'])
        ->middleware('can:files.create')
        ->name('store');

    Route::delete('/bulk', [FileController::class, 'bulkDestroy'])
        ->middleware('can:files.delete')
        ->name('bulkDestroy');

    Route::get('/{file}/download', [FileController::class, 'download'])
        ->middleware('can:files.view')
        ->name('download');

    Route::get('/{file}/preview', [FileController::class, 'preview'])
        ->middleware('can:files.view')
        ->name('preview');

    Route::get('/{file}/text', [FileController::class, 'text'])
        ->middleware('can:files.view')
        ->name('text');

    Route::put('/{file}', [FileController::class, 'update'])
        ->middleware('can:files.update')
        ->name('update');

    Route::delete('/{file}', [FileController::class, 'destroy'])
        ->middleware('can:files.delete')
        ->name('destroy');

    // Folders
    Route::post('/folders', [FileFolderController::class, 'store'])
        ->middleware('can:folders_files.manage')
        ->name('folders.store');

    Route::put('/folders/{folder}', [FileFolderController::class, 'update'])
        ->middleware('can:folders_files.manage')
        ->name('folders.update');

    Route::delete('/folders/{folder}', [FileFolderController::class, 'destroy'])
        ->middleware('can:folders_files.manage')
        ->name('folders.destroy');
});
