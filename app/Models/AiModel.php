<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiModel extends Model
{
    protected $fillable = [
        'ai_configuration_id',
        'name',
        'api_name',
        'is_active',
        'is_selected',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_selected' => 'boolean',
    ];

    public function configuration(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(AiConfiguration::class, 'ai_configuration_id');
    }
}
