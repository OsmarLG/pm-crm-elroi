<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(protected \App\Services\Admin\ProjectService $projectService) {}

    public function index(\App\Http\Requests\Admin\Projects\ProjectIndexRequest $request)
    {
        $filters = $request->validatedFilters();
        $paginator = $this->projectService->paginate(auth()->user(), $filters);
        
        $projects = \App\Http\Resources\Admin\Projects\ProjectResource::collection($paginator);
        $customers = \App\Models\Customer::select('id', 'name')->orderBy('name')->get();

        return inertia('admin/projects/index', [
            'projects' => $projects,
            'customers' => $customers,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        $customers = \App\Models\Customer::all();
        return inertia('admin/projects/create', ['customers' => $customers]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'confidential_info' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed,on_hold,cancelled',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        $project = \App\Models\Project::create($validated);

        // Assign the authenticated user as the owner of the project
        $project->users()->attach(auth()->id(), ['role' => 'owner']);

        return redirect()->route('admin.projects.index')->with('success', 'Project created successfully.');
    }

    public function edit(\App\Models\Project $project)
    {
        $this->authorize('update', $project);

        $project->load([
            'users',
            'invitations' => function ($query) {
                $query->where('status', 'pending');
            }
        ]);
        $customers = \App\Models\Customer::all();

        $currentUser = auth()->user();
        $userRole = 'member';

        if ($currentUser->hasRole('master')) {
            $userRole = 'owner'; // Treat master as owner for UI purposes
        } else {
            $member = $project->users->where('id', $currentUser->id)->first();
            if ($member) {
                $userRole = $member->pivot->role;
            }
        }

        // Only pass confidential_info to owners
        $projectData = $project->toArray();
        if ($userRole !== 'owner') {
            unset($projectData['confidential_info']);
        }

        return inertia('admin/projects/edit', [
            'project' => $projectData,
            'customers' => $customers,
            'user_role' => $userRole
        ]);
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'confidential_info' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed,on_hold,cancelled',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        $project->update($validated);

        return back()->with('success', 'Project updated successfully.');
    }

    public function destroy(\App\Models\Project $project)
    {
        $this->authorize('delete', $project);

        $project->delete();
        return redirect()->route('admin.projects.index')->with('success', 'Project deleted successfully.');
    }
}
