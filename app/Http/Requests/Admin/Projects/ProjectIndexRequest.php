<?php

namespace App\Http\Requests\Admin\Projects;

use Illuminate\Foundation\Http\FormRequest;

class ProjectIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search'      => ['nullable', 'string', 'max:200'],
            'status'      => ['nullable', 'string', 'in:pending,in_progress,completed,on_hold,cancelled'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'sort'        => ['nullable', 'string', 'in:id,name,status,start_date,due_date,created_at'],
            'dir'         => ['nullable', 'string', 'in:asc,desc'],
            'per_page'    => ['nullable', 'integer', 'min:1', 'max:100'],
            'page'        => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function validatedFilters(): array
    {
        $v = $this->validated();

        return [
            'search'      => $v['search'] ?? null,
            'status'      => $v['status'] ?? null,
            'customer_id' => $v['customer_id'] ?? null,
            'sort'        => $v['sort'] ?? 'id',
            'dir'         => $v['dir'] ?? 'desc',
            'per_page'    => $v['per_page'] ?? 10,
        ];
    }
}
