<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $search  = $filters['search'] ?? null;
        $sort    = $filters['sort'] ?? 'id';
        $dir     = $filters['dir'] ?? 'desc';
        $perPage = (int) ($filters['per_page'] ?? 10);

        $allowedSorts = ['id', 'name', 'username', 'email', 'created_at', 'updated_at'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'id';
        }

        $dir = strtolower($dir);
        if (!in_array($dir, ['asc', 'desc'], true)) {
            $dir = 'desc';
        }

        return User::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $dir)
            ->with(['roles.permissions', 'permissions'])
            ->paginate($perPage)
            ->withQueryString();
    }

    public function totalCount(): int
    {
        return User::count();
    }

    public function create(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if (!empty($data['mark_as_verified'])) {
            $user->markEmailAsVerified();
        }

        // ✅ Roles
        $roleIds = array_values(array_unique(array_map('intval', $data['roles'] ?? [])));
        if ($roleIds) {
            $roleNames = Role::whereIn('id', $roleIds)->pluck('name')->all();
            $user->syncRoles($roleNames);
        }

        // ✅ Permisos directos (extras del usuario)
        $permIds = array_values(array_unique(array_map('intval', $data['permissions'] ?? [])));
        if ($permIds) {
            $permNames = Permission::whereIn('id', $permIds)->pluck('name')->all();
            $user->syncPermissions($permNames);
        } else {
            $user->syncPermissions([]); // si quieres que al crear quede limpio
        }

        return $user->refresh()->load(['roles.permissions', 'permissions']);
    }

    public function update(User $user, array $data): User
    {
        $user->name = $data['name'];
        $user->username = $data['username'];
        $user->email = $data['email'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        // marcar como verificado si lo pidieron
        if (!empty($data['mark_as_verified']) && !$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        // opcional: si mandan mark_as_verified=false podrías "desverificar"
        if (array_key_exists('mark_as_verified', $data) && empty($data['mark_as_verified'])) {
            $user->email_verified_at = null;
        }

        $user->save();

        // ✅ Roles
        if (array_key_exists('roles', $data)) {
            $roleIds = array_values(array_unique(array_map('intval', $data['roles'] ?? [])));
            $roleNames = Role::whereIn('id', $roleIds)->pluck('name')->all();
            $user->syncRoles($roleNames);
        }

        // ✅ Permisos directos
        if (array_key_exists('permissions', $data)) {
            $permIds = array_values(array_unique(array_map('intval', $data['permissions'] ?? [])));
            $permNames = Permission::whereIn('id', $permIds)->pluck('name')->all();
            $user->syncPermissions($permNames);
        }

        return $user->refresh()->load(['roles.permissions', 'permissions']);
    }

    public function delete(User $user): void
    {
        if ($user->id === 1) {
            abort(403, 'No se puede eliminar el master.');
        }

        if (auth()->id() === $user->id) {
            abort(403, 'No puedes eliminar tu propio usuario.');
        }

        $user->delete();
    }

    public function bulkDelete(array $ids): int
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));

        // Protecciones
        $ids = array_filter($ids, fn($id) => $id !== 1 && $id !== auth()->id());

        if (empty($ids)) {
            abort(422, 'No hay usuarios válidos para eliminar.');
        }

        return DB::transaction(function () use ($ids) {
            // Si usas soft deletes: esto hará soft delete
            return User::whereIn('id', $ids)->delete();
        });
    }
}
