<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SpatiePivotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $files = [
            'model_has_roles' => glob(database_path('data/model_has_roles_*.json'))[0] ?? null,
            'model_has_permissions' => glob(database_path('data/model_has_permissions_*.json'))[0] ?? null,
            'role_has_permissions' => glob(database_path('data/role_has_permissions_*.json'))[0] ?? null,
        ];

        foreach ($files as $table => $file) {
            if (!$file)
                continue;

            $data = json_decode(file_get_contents($file), true);
            if (empty($data))
                continue;

            $columns = Schema::getColumnListing($table);

            foreach (array_chunk($data, 100) as $chunk) {
                $filteredChunk = array_map(function ($row) use ($columns) {
                    return array_intersect_key($row, array_flip($columns));
                }, $chunk);

                DB::table($table)->insert($filteredChunk);
            }
        }
    }
}
