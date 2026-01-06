<?php

namespace App\Http\Resources\Admin\Users;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => optional($this->created_at)->toDateTimeString(),
            'updated_at' => optional($this->updated_at)->toDateTimeString(),

            'roles' => $this->roles->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
            ])->values(),

            // permisos directos
            'permissions' => $this->permissions->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
            ])->values(),

            // permisos por roles (derivados)
            'role_permissions' => $this->roles
                ->flatMap(fn($r) => $r->permissions)
                ->unique('id')
                ->map(fn($p) => ['id' => $p->id, 'name' => $p->name])
                ->values(),

            // opcional: efectivos
            'all_permissions' => $this->getAllPermissions()
                ->map(fn($p) => ['id' => $p->id, 'name' => $p->name])
                ->values(),
        ];
    }
}
