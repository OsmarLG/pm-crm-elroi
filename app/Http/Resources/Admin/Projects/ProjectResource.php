<?php

namespace App\Http\Resources\Admin\Projects;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'description'       => $this->description,
            'confidential_info' => $this->when(auth()->user()->hasRole('master') || ($this->pivot && $this->pivot->role === 'owner'), $this->confidential_info),
            'status'            => $this->status,
            'start_date'        => optional($this->start_date)->toDateString(),
            'due_date'          => optional($this->due_date)->toDateString(),
            'created_at'        => optional($this->created_at)->toDateTimeString(),
            'updated_at'        => optional($this->updated_at)->toDateTimeString(),
            'customer'          => $this->whenLoaded('customer', fn() => [
                'id'    => $this->customer->id,
                'name'  => $this->customer->name,
                'email' => $this->customer->email,
            ]),
            // Add user role if attached
            'user_role'         => $this->whenPivotLoaded('project_user', fn() => $this->pivot->role),
        ];
    }
}
