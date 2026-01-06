<?php

namespace App\Http\Resources\Files;

use Illuminate\Http\Resources\Json\JsonResource;

class FileResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'folder_id' => $this->folder_id,
            'title' => $this->title,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'created_at' => optional($this->created_at)->toISOString(),
            'folder' => $this->whenLoaded('folder', fn () => [
                'id' => $this->folder?->id,
                'name' => $this->folder?->name,
                'parent_id' => $this->folder?->parent_id,
            ]),
        ];
    }
}
