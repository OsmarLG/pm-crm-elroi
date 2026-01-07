<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Note;
use App\Models\FileItem;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Backfill UUIDs
        Note::whereNull('uuid')->chunk(100, function ($notes) {
            foreach ($notes as $note) {
                $note->uuid = (string) Str::uuid();
                $note->saveQuietly();
            }
        });

        FileItem::whereNull('uuid')->chunk(100, function ($files) {
            foreach ($files as $file) {
                $file->uuid = (string) Str::uuid();
                $file->saveQuietly();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse backfill
    }
};
