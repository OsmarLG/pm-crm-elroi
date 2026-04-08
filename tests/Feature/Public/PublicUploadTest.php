<?php

use App\Models\User;
use App\Models\FileItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    User::factory()->create(); // Ensure we have at least one user
});

it('can upload a file publicly via the "image" field', function () {
    $file = UploadedFile::fake()->image('test-image.jpg');

    $response = $this->postJson(route('api.public.upload'), [
        'image' => $file,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'uuid',
                'public_url',
                'download_url',
            ]
        ]);

    $uuid = $response->json('data.uuid');
    $this->assertDatabaseHas('files', [
        'uuid' => $uuid,
        'visibility' => 'public',
    ]);

    Storage::disk('public')->assertExists(FileItem::where('uuid', $uuid)->first()->path);
});

it('can upload a file publicly via the "file" field', function () {
    $file = UploadedFile::fake()->create('document.pdf', 500);

    $response = $this->postJson(route('api.public.upload'), [
        'file' => $file,
    ]);

    $response->assertStatus(201);
});

it('returns an error if no file is provided', function () {
    $response = $this->postJson(route('api.public.upload'), []);

    $response->assertStatus(400)
        ->assertJsonPath('error', 'No file uploaded. Please use the "image" or "file" field.');
});
