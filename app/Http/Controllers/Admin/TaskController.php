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

        $project = \App\Models\Project::with(['customer', 'users', 'taskStatuses'])->findOrFail($request->project_id);

        // Authorization Check
        $this->authorize('view', $project);

        $tasksQuery = \App\Models\Task::with(['assignee', 'project.customer', 'status'])
            ->where('project_id', $project->id)
            ->orderBy('order_column');

        $tasksCollection = $tasksQuery->get();

        // Group by status slug
        $tasks = $project->taskStatuses->mapWithKeys(function ($status) use ($tasksCollection) {
            return [$status->slug => $tasksCollection->where('task_status_id', $status->id)->values()];
        });

        $currentUser = auth()->user();
        $userRole = 'member';

        // Only get users who are members of this project
        $users = $project->users()->select('users.id', 'users.name')->get();

        if ($currentUser->hasRole('master')) {
            $userRole = 'owner';
        } else {
            $member = $project->users()->where('user_id', $currentUser->id)->first();
            if ($member) {
                $userRole = $member->pivot->role;
            }
        }

        return inertia('admin/tasks/index', [
            'tasks' => $tasks,
            'project' => $project,
            'users' => $users, // This list of users is safe to show to members
            'user_role' => $userRole,
            'statuses' => $project->taskStatuses, // Pass dynamic statuses to frontend
        ]);
    }

    public function updateStatus(\Illuminate\Http\Request $request, \App\Models\Task $task)
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'status' => 'required|string', // This is the slug
            'order_column' => 'required|integer',
        ]);

        $project = $task->project;
        $statusModel = $project->taskStatuses()->where('slug', $validated['status'])->firstOrFail();

        // Check for completion
        if ($statusModel->slug === 'done' && $task->status?->slug !== 'done') {
            $task->completed_at = now();
        } elseif ($validated['status'] !== 'done' && $task->status?->slug === 'done') {
            $task->completed_at = null;
        }

        $task->update([
            'task_status_id' => $statusModel->id,
            'order_column' => $validated['order_column'],
            'completed_at' => $task->completed_at
        ]);

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
            'status' => 'required|string', // slug
            'assigned_to' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        $project = \App\Models\Project::findOrFail($validated['project_id']);
        $this->authorize('view', $project); // Must be member to add task

        $statusModel = $project->taskStatuses()->where('slug', $validated['status'])->firstOrFail();

        $data = $validated;
        unset($data['status']);
        $data['task_status_id'] = $statusModel->id;

        \App\Models\Task::create($data);

        return back()->with('success', 'Task created successfully.');
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\Task $task)
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|string|in:low,medium,high',
            'result_explanation' => 'nullable|string',
            'status' => 'required|string', // slug
            'assigned_to' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        $project = $task->project;
        $statusModel = $project->taskStatuses()->where('slug', $validated['status'])->firstOrFail();

        // Check for completion logic based on 'done' slug
        if ($statusModel->slug === 'done' && $task->status?->slug !== 'done') {
            $task->completed_at = now();
        } elseif ($statusModel->slug !== 'done' && $task->status?->slug === 'done') {
            $task->completed_at = null;
        }

        $data = $validated;
        unset($data['status']);
        $data['task_status_id'] = $statusModel->id;
        $data['completed_at'] = $task->completed_at;

        $task->update($data);

        return back()->with('success', 'Task updated successfully.');
    }

    public function destroy(\App\Models\Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return back()->with('success', 'Task deleted successfully.');
    }
}
