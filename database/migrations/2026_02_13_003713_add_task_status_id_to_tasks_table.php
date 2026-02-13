<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('task_status_id')->nullable()->constrained('task_statuses')->nullOnDelete()->after('project_id');
        });

        // Data Migration
        $projects = DB::table('projects')->get();
        $defaultStatuses = [
            ['name' => 'Backlog', 'slug' => 'backlog', 'order_column' => 0, 'color' => 'gray', 'is_default' => true],
            ['name' => 'Todo', 'slug' => 'todo', 'order_column' => 1, 'color' => 'blue', 'is_default' => true],
            ['name' => 'In Progress', 'slug' => 'in_progress', 'order_column' => 2, 'color' => 'yellow', 'is_default' => true],
            ['name' => 'Done', 'slug' => 'done', 'order_column' => 3, 'color' => 'green', 'is_default' => true],
            ['name' => 'Rejected', 'slug' => 'rejected', 'order_column' => 4, 'color' => 'red', 'is_default' => true],
        ];

        foreach ($projects as $project) {
            foreach ($defaultStatuses as $status) {
                $insertedId = DB::table('task_statuses')->insertGetId(array_merge($status, [
                    'project_id' => $project->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]));

                // Update tasks matching this status slug
                DB::table('tasks')
                    ->where('project_id', $project->id)
                    ->where('status', $status['slug'])
                    ->update(['task_status_id' => $insertedId]);
            }

            // Fallback for tasks with unknown status -> move to Backlog
            $backlogId = DB::table('task_statuses')
                ->where('project_id', $project->id)
                ->where('slug', 'backlog')
                ->value('id');

            DB::table('tasks')
                ->where('project_id', $project->id)
                ->whereNull('task_status_id')
                ->update(['task_status_id' => $backlogId]);
        }

        // Make column non-nullable after migration (optional, but safer to keep nullable if data migration fails or for future safety?)
        // Let's keep it nullable or enforce it. Given existing data validation, let's enforce constraint if we are confident.
        // Actually, let's just drop the old column.

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('status')->default('todo')->after('description');
        });

        // Attempt to restore status string from relationship (reverse logic)
        // This is complex in down(), so usually we accept data loss or just restore column.

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['task_status_id']);
            $table->dropColumn('task_status_id');
        });
    }
};
