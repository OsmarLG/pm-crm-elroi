<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->has('project_id')) {
            return redirect()->route('admin.projects.index');
        }

        $project = \App\Models\Project::with('customer')->findOrFail($request->project_id);

        $tasks = \App\Models\Task::with(['assignee', 'project.customer'])
            ->where('project_id', $project->id)
            ->orderBy('order_column')
            ->get()
            ->groupBy('status');

        $users = \App\Models\User::all(['id', 'name']);

        return inertia('admin/tasks/index', [
            'tasks' => $tasks,
            'project' => $project,
            'users' => $users,
        ]);
    }

    public function updateStatus(\Illuminate\Http\Request $request, \App\Models\Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'order_column' => 'required|integer',
        ]);

        $task->update($validated);

        return back();
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|string|in:low,medium,high',
            'result_explanation' => 'nullable|string',
            'status' => 'required|string',
            'assigned_to' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        \App\Models\Task::create($validated);

        return back()->with('success', 'Task created successfully.');
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|string|in:low,medium,high',
            'result_explanation' => 'nullable|string',
            'status' => 'required|string',
            'assigned_to' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

        return back()->with('success', 'Task updated successfully.');
    }

    public function destroy(\App\Models\Task $task)
    {
        $task->delete();

        return back()->with('success', 'Task deleted successfully.');
    }
}
