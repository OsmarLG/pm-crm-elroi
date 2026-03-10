<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Project;
use App\Models\Customer;
use App\Models\Task;
use App\Models\TaskStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    
    $this->customer = Customer::create([
        'name' => 'Test Customer',
        'email' => 'test@customer.com',
    ]);
});

it('reassigns tasks to project owner when a member is removed', function () {
    // Create a project
    $project = Project::create([
        'customer_id' => $this->customer->id,
        'name' => 'Test Project',
        'status' => 'pending',
    ]);
    
    // Assign an owner (the current user)
    $project->users()->attach($this->user->id, ['role' => 'owner']);
    
    // Create a member
    $member = User::factory()->create();
    $project->users()->attach($member->id, ['role' => 'member']);
    
    // Get a task status (Backlog is created by booted method)
    $status = $project->taskStatuses()->first();
    
    // Create a task assigned to the member
    $task = Task::create([
        'project_id' => $project->id,
        'title' => 'Member Task',
        'task_status_id' => $status->id,
        'assigned_to' => $member->id,
    ]);
    
    // Remove the member
    $response = $this->delete(route('admin.projects.members.destroy', [$project, $member]));
    
    $response->assertSessionHas('success', 'Member removed successfully.');
    
    // Verify member is removed from project
    $this->assertDatabaseMissing('project_user', [
        'project_id' => $project->id,
        'user_id' => $member->id,
    ]);
    
    // Verify task is reassigned to the owner
    $task->refresh();
    expect($task->assigned_to)->toBe($this->user->id);
});

it('reassigns tasks to another owner when an owner is removed', function () {
    // Create a project
    $project = Project::create([
        'customer_id' => $this->customer->id,
        'name' => 'Test Project',
        'status' => 'pending',
    ]);
    
    // Assign two owners
    $owner1 = $this->user; // The current user
    $project->users()->attach($owner1->id, ['role' => 'owner']);
    
    $owner2 = User::factory()->create();
    $project->users()->attach($owner2->id, ['role' => 'owner']);
    
    // Get a task status
    $status = $project->taskStatuses()->first();
    
    // Create a task assigned to owner2
    $task = Task::create([
        'project_id' => $project->id,
        'title' => 'Owner 2 Task',
        'task_status_id' => $status->id,
        'assigned_to' => $owner2->id,
    ]);
    
    // Remove owner2 (acting as owner1)
    $response = $this->delete(route('admin.projects.members.destroy', [$project, $owner2]));
    
    $response->assertSessionHas('success', 'Member removed successfully.');
    
    // Verify task is reassigned to owner1
    $task->refresh();
    expect($task->assigned_to)->toBe($owner1->id);
});

it('prevents removing the last owner', function () {
    // Create a project
    $project = Project::create([
        'customer_id' => $this->customer->id,
        'name' => 'Test Project',
        'status' => 'pending',
    ]);
    
    // Assign only one owner
    $project->users()->attach($this->user->id, ['role' => 'owner']);
    
    // Try to remove the last owner
    $response = $this->delete(route('admin.projects.members.destroy', [$project, $this->user]));
    
    $response->assertSessionHasErrors(['error' => 'Cannot remove the last owner of the project.']);
    
    // Verify owner is still there
    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $this->user->id,
    ]);
});

it('prevents non-authorized users from removing project members', function () {
    // Create a project
    $project = Project::create([
        'customer_id' => $this->customer->id,
        'name' => 'Test Project',
        'status' => 'pending',
    ]);
    
    // Assign an owner
    $owner = User::factory()->create();
    $project->users()->attach($owner->id, ['role' => 'owner']);
    
    // Create a member
    $member = User::factory()->create();
    $project->users()->attach($member->id, ['role' => 'member']);
    
    // Create another user (not member)
    $otherUser = User::factory()->create();
    $this->actingAs($otherUser);
    
    // Try to remove the member
    $response = $this->delete(route('admin.projects.members.destroy', [$project, $member]));
    
    $response->assertForbidden();
    
    // Verify member is still there
    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $member->id,
    ]);
});
