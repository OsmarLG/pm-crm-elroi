<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\User;
use Illuminate\Validation\Rule;

class ProjectMemberController extends Controller
{
    public function index(Project $project)
    {
        return $project->users;
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:admin,member',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Check if user is already a member
        if ($project->users()->where('user_id', $user->id)->exists()) {
            return back()->withErrors(['email' => 'User is already a member of this project.']);
        }

        $project->users()->attach($user->id, ['role' => $validated['role']]);

        return back()->with('success', 'Member added successfully.');
    }

    public function update(Request $request, Project $project, User $member)
    {
        $validated = $request->validate([
            'role' => 'required|in:admin,member,owner',
        ]);

        $project->users()->updateExistingPivot($member->id, ['role' => $validated['role']]);

        return back()->with('success', 'Member role updated successfully.');
    }

    public function destroy(Project $project, User $member)
    {
        // Prevent removing the last owner
        if ($member->pivot->role === 'owner' && $project->users()->wherePivot('role', 'owner')->count() <= 1) {
            return back()->withErrors(['error' => 'Cannot remove the last owner of the project.']);
        }

        $project->users()->detach($member->id);

        return back()->with('success', 'Member removed successfully.');
    }
}
