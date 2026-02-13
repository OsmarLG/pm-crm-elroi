<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiConfiguration extends Model
{
    protected $fillable = [
        'provider',
        'api_key',
        'is_active',
        'meta',
    ];

    protected $casts = [
        'api_key' => 'encrypted',
        'is_active' => 'boolean',
        'meta' => 'array',
    ];

    public function models(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AiModel::class);
    }
}
