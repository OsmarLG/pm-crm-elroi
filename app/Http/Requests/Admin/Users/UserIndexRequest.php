<?php

namespace App\Http\Requests\Admin\Users;

use Illuminate\Foundation\Http\FormRequest;

class UserIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // luego aquí metes policies/roles si quieres
    }

    public function rules(): array
    {
        return [
            'search'   => ['nullable', 'string', 'max:200'],
            'sort'     => ['nullable', 'string', 'in:id,name,username,email,created_at,updated_at'],
            'dir'      => ['nullable', 'string', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page'     => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function validatedFilters(): array
    {
        $v = $this->validated();

        return [
            'search'   => $v['search'] ?? null,
            'sort'     => $v['sort'] ?? 'id',
            'dir'      => $v['dir'] ?? 'desc',
            'per_page' => $v['per_page'] ?? 20,
        ];
    }
}
