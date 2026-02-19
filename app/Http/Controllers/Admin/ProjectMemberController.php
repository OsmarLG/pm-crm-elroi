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

        // Ensure we have the user with pivot data for this specific project
        $projectMember = $project->users()->where('user_id', $member->id)->first();

        if (!$projectMember) {
            return back()->withErrors(['error' => 'User is not a member of this project.']);
        }

        // Prevent demoting the last owner
        if ($projectMember->pivot->role === 'owner' && $validated['role'] !== 'owner') {
            if ($project->users()->wherePivot('role', 'owner')->count() <= 1) {
                return back()->withErrors(['error' => 'Cannot change the role of the last owner. Assign another owner first.']);
            }
        }

        $project->users()->updateExistingPivot($member->id, ['role' => $validated['role']]);

        return back()->with('success', 'Member role updated successfully.');
    }

    public function destroy(Project $project, User $member)
    {
        // Ensure we have the user with pivot data
        $projectMember = $project->users()->where('user_id', $member->id)->first();

        if (!$projectMember) {
            return back()->withErrors(['error' => 'User is not a member of this project.']);
        }

        // Prevent removing the last owner
        if ($projectMember->pivot->role === 'owner' && $project->users()->wherePivot('role', 'owner')->count() <= 1) {
            return back()->withErrors(['error' => 'Cannot remove the last owner of the project.']);
        }

        // Reassign tasks to another owner
        // Find an owner who is NOT the member being removed
        $newOwner = $project->users()
            ->wherePivot('role', 'owner')
            ->where('users.id', '!=', $member->id)
            ->first();

        // If no other owner found (e.g. only one owner and we are removing a member), pick any other admin or member?
        // Requirement was "assign to the owner". If the removed user is NOT the ONLY owner, there should be another owner.
        // If the removed user was a member, any owner is fine.

        if (!$newOwner) {
            // Fallback: If no other owner exists (which shouldn't happen if we are removing a member and an owner exists),
            // try to find the project creator or any admin. 
            // Ideally we should always have at least one owner.
            // If $projectMember is 'member', there must be an 'owner'. 
            // If $projectMember is 'owner', we checked count > 1, so there must be another.
            // So $newOwner should theoretically be found unless data integrity is compromised.

            // Let's just pick the first user with 'owner' role.
            $newOwner = $project->users()->wherePivot('role', 'owner')->first();
        }

        if ($newOwner) {
            \App\Models\Task::where('project_id', $project->id)
                ->where('assigned_to', $member->id)
                ->update(['assigned_to' => $newOwner->id]);
        }

        $project->users()->detach($member->id);

        return back()->with('success', 'Member removed successfully.');
    }
}
