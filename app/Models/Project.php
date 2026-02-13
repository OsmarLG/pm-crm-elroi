<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    protected $fillable = ['customer_id', 'name', 'description', 'status', 'start_date', 'due_date'];

    protected static function booted()
    {
        static::created(function ($project) {
            $statuses = [
                ['name' => 'Backlog', 'slug' => 'backlog', 'order_column' => 0, 'color' => 'gray', 'is_default' => true],
                ['name' => 'Todo', 'slug' => 'todo', 'order_column' => 1, 'color' => 'blue', 'is_default' => true],
                ['name' => 'In Progress', 'slug' => 'in-progress', 'order_column' => 2, 'color' => 'yellow', 'is_default' => true],
                ['name' => 'Done', 'slug' => 'done', 'order_column' => 3, 'color' => 'green', 'is_default' => true],
                ['name' => 'Rejected', 'slug' => 'rejected', 'order_column' => 4, 'color' => 'red', 'is_default' => true],
            ];

            foreach ($statuses as $status) {
                $project->taskStatuses()->create($status);
            }
        });
    }

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function taskStatuses()
    {
        return $this->hasMany(TaskStatus::class)->orderBy('order_column');
    }
    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    public function invitations()
    {
        return $this->hasMany(ProjectInvitation::class);
    }

    public function owner()
    {
        return $this->users()->wherePivot('role', 'owner')->first();
    }

    public function admins()
    {
        return $this->users()->wherePivot('role', 'admin')->get();
    }

    public function members()
    {
        return $this->users()->wherePivot('role', 'member')->get();
    }
}
