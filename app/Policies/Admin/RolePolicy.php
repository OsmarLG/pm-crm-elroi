<?php

namespace App\Policies\Admin;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    /**
     * IDs protegidos (no delete).
     */
    private const PROTECTED_IDS = [1, 2, 3];

    private function isMaster(User $user): bool
    {
        return $user->hasRole('master');
    }

    private function isAdmin(User $user): bool
    {
        // admin "puro": si también es master, manda master
        return !$this->isMaster($user) && $user->hasRole('admin');
    }

    private function isProtected(Role $role): bool
    {
        return in_array((int) $role->id, self::PROTECTED_IDS, true);
    }

    private function isUsersOwnRole(User $user, Role $role): bool
    {
        // Si el usuario tiene ese rol asignado, es “su rol”
        return $user->roles->contains(fn ($r) => (int) $r->id === (int) $role->id);
    }

    private function isMasterRole(Role $role): bool
    {
        return $role->name === 'master' || (int) $role->id === 1;
    }

    private function isAdminRole(Role $role): bool
    {
        return $role->name === 'admin' || (int) $role->id === 2;
    }

    public function viewAny(User $user): bool
    {
        return $this->isMaster($user) || $this->isAdmin($user);
    }

    public function view(User $user, Role $role): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        // Ajusta si quieres que solo master cree
        return $this->isMaster($user) || $this->isAdmin($user);
    }

    public function update(User $user, Role $role): bool
    {
        if ($this->isMaster($user)) {
            // master no puede modificar su(s) rol(es)
            return !$this->isUsersOwnRole($user, $role);
        }

        if ($this->isAdmin($user)) {
            // admin no puede modificar master ni admin ni su(s) rol(es)
            if ($this->isMasterRole($role) || $this->isAdminRole($role)) return false;
            return !$this->isUsersOwnRole($user, $role);
        }

        return false;
    }

    public function delete(User $user, Role $role): bool
    {
        // Nadie elimina protegidos 1,2,3
        if ($this->isProtected($role)) return false;

        if ($this->isMaster($user)) {
            // master no elimina su(s) rol(es)
            return !$this->isUsersOwnRole($user, $role);
        }

        if ($this->isAdmin($user)) {
            // admin no elimina master/admin ni su(s) rol(es)
            if ($this->isMasterRole($role) || $this->isAdminRole($role)) return false;
            return !$this->isUsersOwnRole($user, $role);
        }

        return false;
    }
}
