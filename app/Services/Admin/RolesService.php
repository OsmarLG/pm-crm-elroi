<?php

namespace App\Services\Admin;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesService
{
    /**
     * Centraliza search/sort/paginate para evitar duplicación.
     */
    private function paginateQuery(Builder $query, array $filters, array $allowedSorts): LengthAwarePaginator
    {
        $search  = $filters['search'] ?? null;
        $sort    = $filters['sort'] ?? 'id';
        $dir     = strtolower($filters['dir'] ?? 'desc');
        $perPage = (int) ($filters['per_page'] ?? 10);

        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'id';
        }

        if (!in_array($dir, ['asc', 'desc'], true)) {
            $dir = 'desc';
        }

        return $query
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy($sort, $dir)
            ->paginate($perPage)
            ->withQueryString();
    }

    // -------------------------
    // Roles
    // -------------------------

    public function rolesPaginate(array $filters): LengthAwarePaginator
    {
        $allowedSorts = ['id', 'name', 'created_at', 'updated_at'];

        $query = Role::query()
            ->with(['permissions:id,name,guard_name'])
            ->withCount('permissions');

        // opcional: filtrar por guard
        if (!empty($filters['guard_name'])) {
            $query->where('guard_name', $filters['guard_name']);
        }

        return $this->paginateQuery($query, $filters, $allowedSorts);
    }

    public function rolesTotalCount(?string $guardName = null): int
    {
        return Role::query()
            ->when($guardName, fn ($q) => $q->where('guard_name', $guardName))
            ->count();
    }

    public function createRole(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            $role = Role::create([
                'name' => $data['name'],
                'guard_name' => $data['guard_name'] ?? config('auth.defaults.guard', 'web'),
            ]);

            // syncPermissions acepta ids, names, modelos
            if (array_key_exists('permissions', $data)) {
                $role->syncPermissions($data['permissions'] ?? []);
            }

            return $role->load(['permissions:id,name,guard_name']);
        });
    }

    public function updateRole(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data) {
            $role->update([
                'name' => $data['name'],
                // guard_name normalmente no conviene cambiarlo en update
            ]);

            if (array_key_exists('permissions', $data)) {
                $role->syncPermissions($data['permissions'] ?? []);
            }

            return $role->load(['permissions:id,name,guard_name']);
        });
    }

    public function deleteRole(Role $role): void
    {
        DB::transaction(fn () => $role->delete());
    }

    public function bulkDeleteRoles(array $roleIds): int
    {
        return DB::transaction(function () use ($roleIds) {
            return Role::whereIn('id', $roleIds)->delete();
        });
    }

    public function rolesList(?string $guardName = null)
    {
        return Role::query()
            ->select(['id', 'name', 'guard_name'])
            ->when($guardName, fn ($q) => $q->where('guard_name', $guardName))
            ->orderBy('name')
            ->get();
    }

    // -------------------------
    // Permissions
    // -------------------------

    public function permissionsPaginate(array $filters): LengthAwarePaginator
    {
        $allowedSorts = ['id', 'name', 'created_at', 'updated_at'];

        $query = Permission::query()
            ->with(['roles:id,name,guard_name'])
            ->withCount('roles');

        if (!empty($filters['guard_name'])) {
            $query->where('guard_name', $filters['guard_name']);
        }

        return $this->paginateQuery($query, $filters, $allowedSorts);
    }

    public function permissionsTotalCount(?string $guardName = null): int
    {
        return Permission::query()
            ->when($guardName, fn ($q) => $q->where('guard_name', $guardName))
            ->count();
    }

    public function createPermission(array $data): Permission
    {
        return DB::transaction(function () use ($data) {
            $permission = Permission::create([
                'name' => $data['name'],
                'guard_name' => $data['guard_name'] ?? config('auth.defaults.guard', 'web'),
            ]);

            if (array_key_exists('roles', $data)) {
                $permission->syncRoles($data['roles'] ?? []);
            }

            return $permission->load(['roles:id,name,guard_name']);
        });
    }

    public function updatePermission(Permission $permission, array $data): Permission
    {
        return DB::transaction(function () use ($permission, $data) {
            $permission->update([
                'name' => $data['name'],
            ]);

            if (array_key_exists('roles', $data)) {
                $permission->syncRoles($data['roles'] ?? []);
            }

            return $permission->load(['roles:id,name,guard_name']);
        });
    }

    public function deletePermission(Permission $permission): void
    {
        DB::transaction(fn () => $permission->delete());
    }

    public function bulkDeletePermissions(array $permissionIds): int
    {
        return DB::transaction(function () use ($permissionIds) {
            return Permission::whereIn('id', $permissionIds)->delete();
        });
    }

    public function permissionsList(?string $guardName = null)
    {
        return Permission::query()
            ->select(['id', 'name', 'guard_name'])
            ->when($guardName, fn ($q) => $q->where('guard_name', $guardName))
            ->orderBy('name')
            ->get();
    }
}
