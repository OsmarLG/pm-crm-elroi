<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\TaskStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaskStatusController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
        ]);

        $maxOrder = $project->taskStatuses()->max('order_column') ?? -1;

        $project->taskStatuses()->create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(4), // Ensure uniqueness
            'color' => $validated['color'] ?? 'gray',
            'order_column' => $maxOrder + 1,
            'is_default' => false,
        ]);

        return back()->with('success', 'Column added successfully.');
    }

    public function update(Request $request, Project $project, TaskStatus $taskStatus)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
        ]);

        $taskStatus->update([
            'name' => $validated['name'],
            'color' => $validated['color'],
        ]);

        return back()->with('success', 'Column updated successfully.');
    }

    public function reorder(Request $request, Project $project)
    {
        $validated = $request->validate([
            'statuses' => 'required|array',
            'statuses.*.id' => 'required|integer|exists:task_statuses,id',
            'statuses.*.order_column' => 'required|integer',
        ]);

        foreach ($validated['statuses'] as $status) {
            TaskStatus::where('id', $status['id'])
                ->where('project_id', $project->id)
                ->update(['order_column' => $status['order_column']]);
        }

        return back()->with('success', 'Columns reordered successfully.');
    }

    public function destroy(Project $project, TaskStatus $taskStatus)
    {
        if ($taskStatus->is_default) {
            return back()->with('error', 'Cannot delete default system columns.');
        }

        if ($taskStatus->tasks()->count() > 0) {
            // Move tasks to Backlog or prevent?
            // Simplest: Move to Backlog (or first column)
            $backlog = $project->taskStatuses()->orderBy('order_column')->first();
            if ($backlog && $backlog->id !== $taskStatus->id) {
                $taskStatus->tasks()->update(['task_status_id' => $backlog->id]);
            } else {
                return back()->with('error', 'Cannot delete column with tasks.');
            }
        }

        $taskStatus->delete();

        return back()->with('success', 'Column deleted successfully.');
    }
}
