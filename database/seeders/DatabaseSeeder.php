<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RolesAndUsersSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::firstOrCreate(
        //     ['email' => 'lieragomezosmaralejandro@gmail.com'],
        //     [
        //         'name' => 'Osmar Liera',
        //         'password' => 'password',
        //         'email_verified_at' => now(),
        //     ]
        // );

        $this->call([
            RolesAndUsersSeeder::class,
        ]);
    }
}
