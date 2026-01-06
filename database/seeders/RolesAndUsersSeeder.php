<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Limpia cache de permisos
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        /**
         * ======================
         * Permisos
         * ======================
         */
        $permissions = [
            // users
            'users.view',
            'users.create',
            'users.update',
            'users.delete',

            // notes
            'notes.view',
            'notes.create',
            'notes.update',
            'notes.delete',
            
            // folders
            'folders.manage',
            
            // files
            'files.view',
            'files.create',
            'files.update',
            'files.delete',

            // folders files
            'folders_files.manage',

            // system
            'roles.manage',
            'permissions.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        /**
         * ======================
         * Roles
         * ======================
         */
        $master = Role::firstOrCreate(['name' => 'master']);
        $admin  = Role::firstOrCreate(['name' => 'admin']);
        $member = Role::firstOrCreate(['name' => 'member']);

        // Master → todo
        $master->syncPermissions(Permission::all());

        // Admin → casi todo menos sistema crítico
        $admin->syncPermissions([
            'users.view',
            'users.create',
            'users.update',

            'notes.view',
            'notes.create',
            'notes.update',
            'notes.delete',

            'folders.manage',

            'files.view',
            'files.create',
            'files.update',
            'files.delete',

            'folders_files.manage',
        ]);

        // Member → solo lo suyo
        $member->syncPermissions([
            'notes.view',
            'notes.create',
            'notes.update',
            'notes.delete',
            'folders.manage',
            'files.view',
            'files.create',
            'files.update',
            'files.delete',
            'folders_files.manage',
        ]);

        /**
         * ======================
         * Usuarios
         * ======================
         */

        // MASTER (TÚ)
        $masterUser = User::firstOrCreate(
            ['email' => 'lieragomezosmaralejandro@gmail.com', 'username' => 'osmarlg'],
            [
                'name' => 'Osmar Liera',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $masterUser->syncRoles(['master']);

        // // ADMIN
        // $adminUser = User::firstOrCreate(
        //     ['email' => 'admin@elroi.test', 'username' => 'admin'],
        //     [
        //         'name' => 'Admin User',
        //         'password' => Hash::make('password'),
        //         'email_verified_at' => now(),
        //     ]
        // );
        // $adminUser->syncRoles(['admin']);

        // // MEMBER
        // $memberUser = User::firstOrCreate(
        //     ['email' => 'member@elroi.test', 'username' => 'member'],
        //     [
        //         'name' => 'Member User',
        //         'password' => Hash::make('password'),
        //         'email_verified_at' => now(),
        //     ]
        // );
        // $memberUser->syncRoles(['member']);
    }
}
