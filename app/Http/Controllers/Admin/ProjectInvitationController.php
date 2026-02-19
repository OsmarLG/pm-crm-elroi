<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProjectInvitationController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $request->validate([
            'email' => 'required_without:username|email|nullable',
            'username' => 'required_without:email|string|nullable',
            'role' => 'required|in:admin,member',
        ]);

        $email = $request->email;

        // If username provided, find email
        if ($request->username) {
            $user = User::where('username', $request->username)->first();
            if (!$user) {
                return back()->withErrors(['username' => 'User not found.']);
            }
            $email = $user->email;
        }

        // Check if user is already a member
        $existingMember = $project->users()->where('email', $email)->exists();
        if ($existingMember) {
            return back()->withErrors(['email' => 'User is already a member of this project.']);
        }

        // Check for existing invitation (any status)
        $existingInvite = $project->invitations()->where('email', $email)->first();

        if ($existingInvite) {
            if ($existingInvite->status === 'pending') {
                return back()->withErrors(['email' => 'Invitation already sent to this user.']);
            }

            // If found and not pending (e.g. rejected or accepted but removed), re-invite
            $existingInvite->update([
                'token' => Str::random(32),
                'role' => $request->role,
                'status' => 'pending',
                'invited_by' => auth()->id(),
            ]);

            return back()->with('success', 'Invitation sent successfully.');
        }

        ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => $email,
            'username' => $request->username,
            'token' => Str::random(32),
            'role' => $request->role,
            'status' => 'pending',
            'invited_by' => auth()->id(),
        ]);

        return back()->with('success', 'Invitation sent successfully.');
    }

    public function destroy(Project $project, ProjectInvitation $invitation)
    {
        $invitation->delete();
        return back()->with('success', 'Invitation cancelled.');
    }

    public function index()
    {
        $invitations = ProjectInvitation::with(['project', 'inviter'])
            ->where('email', auth()->user()->email)
            ->where('status', 'pending')
            ->get();

        return inertia('admin/invitations/index', [
            'invitations' => $invitations
        ]);
    }

    public function accept(ProjectInvitation $invitation)
    {
        if ($invitation->email !== auth()->user()->email) {
            abort(403);
        }

        if ($invitation->status === 'accepted') {
            return to_route('collaborations.invitations.index')->with('info', 'Invitation already accepted.');
        }

        if ($invitation->project->users()->where('user_id', auth()->id())->exists()) {
            $invitation->update(['status' => 'accepted']);
            return to_route('collaborations.invitations.index')->with('info', 'You are already a member of this project.');
        }

        DB::transaction(function () use ($invitation) {
            $invitation->project->users()->attach(auth()->id(), ['role' => $invitation->role]);
            $invitation->update(['status' => 'accepted']);
        });

        return to_route('collaborations.invitations.index')->with('success', 'Invitation accepted. You are now a member of ' . $invitation->project->name);
    }

    public function reject(ProjectInvitation $invitation)
    {
        if ($invitation->email !== auth()->user()->email) {
            abort(403);
        }

        $invitation->update(['status' => 'rejected']);

        return back()->with('success', 'Invitation rejected.');
    }
}
