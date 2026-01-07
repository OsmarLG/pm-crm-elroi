<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    protected $fillable = ['user_id', 'folder_id', 'title', 'content', 'visibility', 'uuid'];

    protected static function booted(): void
    {
        static::creating(function (Note $note) {
            $note->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }
}