<?php

namespace App\Http\Resources\Files;

use Illuminate\Http\Resources\Json\JsonResource;

class FileFolderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'children' => FileFolderResource::collection($this->whenLoaded('children')),
        ];
    }
}
