<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/public/upload', [\App\Http\Controllers\Public\PublicUploadController::class, 'store'])->name('api.public.upload');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
