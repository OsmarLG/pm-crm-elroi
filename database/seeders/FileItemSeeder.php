<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FileItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = glob(database_path('data/files_*.json'))[0] ?? null;
        if (!$file)
            return;

        $data = json_decode(file_get_contents($file), true);
        $columns = Schema::getColumnListing('files');

        foreach (array_chunk($data, 100) as $chunk) {
            $filteredChunk = array_map(function ($row) use ($columns) {
                return array_intersect_key($row, array_flip($columns));
            }, $chunk);

            DB::table('files')->insert($filteredChunk);
        }
    }
}
