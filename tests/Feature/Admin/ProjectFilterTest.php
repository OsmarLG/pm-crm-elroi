<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Project;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    \Spatie\Permission\Models\Role::create(['name' => 'master']);
    $this->user = User::factory()->create();
    $this->user->assignRole('master'); 
    $this->actingAs($this->user);
    
    $this->customer1 = Customer::create(['name' => 'Alpha Corp', 'email' => 'alpha@test.com']);
    $this->customer2 = Customer::create(['name' => 'Beta Inc', 'email' => 'beta@test.com']);
});

it('filters projects by name', function () {
    Project::create(['customer_id' => $this->customer1->id, 'name' => 'Website Redesign', 'status' => 'pending']);
    Project::create(['customer_id' => $this->customer1->id, 'name' => 'Mobile App', 'status' => 'pending']);

    $response = $this->get(route('admin.projects.index', ['search' => 'Website']));

    $response->assertInertia(fn ($page) => $page
        ->has('projects.data', 1)
        ->where('projects.data.0.name', 'Website Redesign')
    );
});

it('filters projects by status', function () {
    Project::create(['customer_id' => $this->customer1->id, 'name' => 'Project A', 'status' => 'completed']);
    Project::create(['customer_id' => $this->customer1->id, 'name' => 'Project B', 'status' => 'pending']);

    $response = $this->get(route('admin.projects.index', ['status' => 'completed']));

    $response->assertInertia(fn ($page) => $page
        ->has('projects.data', 1)
        ->where('projects.data.0.status', 'completed')
    );
});

it('filters projects by customer', function () {
    Project::create(['customer_id' => $this->customer1->id, 'name' => 'Project 1', 'status' => 'pending']);
    Project::create(['customer_id' => $this->customer2->id, 'name' => 'Project 2', 'status' => 'pending']);

    $response = $this->get(route('admin.projects.index', ['customer_id' => $this->customer2->id]));

    $response->assertInertia(fn ($page) => $page
        ->has('projects.data', 1)
        ->where('projects.data.0.customer.id', $this->customer2->id)
    );
});

it('orders projects by urgency (due date)', function () {
    Project::create([
        'customer_id' => $this->customer1->id, 
        'name' => 'Late Project', 
        'status' => 'pending', 
        'due_date' => now()->addDays(10)
    ]);
    Project::create([
        'customer_id' => $this->customer1->id, 
        'name' => 'Urgent Project', 
        'status' => 'pending', 
        'due_date' => now()->addDays(2)
    ]);

    $response = $this->get(route('admin.projects.index', ['sort' => 'due_date', 'dir' => 'asc']));

    $response->assertInertia(fn ($page) => $page
        ->has('projects.data', 2)
        ->where('projects.data.0.name', 'Urgent Project')
        ->where('projects.data.1.name', 'Late Project')
    );
});
