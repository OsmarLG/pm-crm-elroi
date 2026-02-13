<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\ProjectInvitation;

class CollaborationController extends Controller
{
    /**
     * List projects the user is a member of.
     */
    public function projects(Request $request)
    {
        $user = $request->user();

        // Projects where user is attached via 'project_user' table
        $projects = $user->projects()
            ->with(['customer', 'users']) // eager load needed relationships
            ->latest()
            ->paginate(10);

        return Inertia::render('collaborations/projects/index', [
            'projects' => $projects
        ]);
    }

    /**
     * List pending invitations for the user.
     */
    public function invitations(Request $request)
    {
        // Reuse the logic from ProjectInvitationController or just redirect?
        // Let's implement a dedicated view for cleaner separation if needed,
        // or just reuse the existing one if it fits. 
        // The user wants "Invitations" in this "Collaborations" group.

        // For now, we can reuse the existing 'admin/invitations/index' view logic 
        // but serve it from here, or just redirect.
        // But better to have a dedicated route/method to keep it clean.

        $invitations = ProjectInvitation::with(['project', 'inviter'])
            ->where('email', $request->user()->email)
            ->where('status', 'pending')
            ->latest()
            ->get();

        // We can reuse the same component 'admin/invitations/index' 
        // or create a new one 'collaborations/invitations/index'.
        // Let's create a new one to mimic the structure.
        return Inertia::render('collaborations/invitations/index', [
            'invitations' => $invitations
        ]);
    }
}
