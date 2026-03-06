<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Database\Seeders\RolesAndUsersSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            SpatiePivotSeeder::class,
            CustomerSeeder::class,
            ProjectSeeder::class,
            ProjectUserSeeder::class,
            ProjectInvitationSeeder::class,
            TaskStatusSeeder::class,
            TaskSeeder::class,
            FolderSeeder::class,
                // FileItemSeeder::class,
            FileFolderSeeder::class,
            NoteSeeder::class,
            AiModelSeeder::class,
            AiConfigurationSeeder::class,
        ]);

        Schema::enableForeignKeyConstraints();
    }
}
