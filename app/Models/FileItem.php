<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FileItem extends Model
{
    protected $table = 'files';

    protected $fillable = [
        'user_id',
        'folder_id',
        'title',
        'original_name',
        'disk',
        'path',
        'mime_type',
        'size',
        'visibility',
        'uuid',
    ];

    protected static function booted(): void
    {
        static::creating(function (FileItem $file) {
            $file->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(FileFolder::class, 'folder_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
