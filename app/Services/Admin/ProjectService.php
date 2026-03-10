<?php

namespace App\Services\Admin;

use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProjectService
{
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        $search     = $filters['search'] ?? null;
        $status     = $filters['status'] ?? null;
        $customerId = $filters['customer_id'] ?? null;
        $sort       = $filters['sort'] ?? 'id';
        $dir        = $filters['dir'] ?? 'desc';
        $perPage    = (int) ($filters['per_page'] ?? 10);

        $query = Project::query()->with('customer');

        // Authorization: Master sees all, others see only theirs
        if (!$user->hasRole('master')) {
            $query->whereHas('users', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Filtering
        $query->when($search, function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%");
        });

        $query->when($status, function ($q) use ($status) {
            $q->where('status', $status);
        });

        $query->when($customerId, function ($q) use ($customerId) {
            $q->where('customer_id', $customerId);
        });

        // Ordering
        $allowedSorts = ['id', 'name', 'status', 'start_date', 'due_date', 'created_at', 'updated_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $dir);
        } else {
            $query->latest();
        }

        return $query->paginate($perPage)->withQueryString();
    }
}
