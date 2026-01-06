<?php

namespace App\Http\Requests\Admin\Users;

use Illuminate\Foundation\Http\FormRequest;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? null;

        return [
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:60', 'unique:users,username,' . $userId],
            'email' => ['required', 'string', 'email', 'max:190', 'unique:users,email,' . $userId],
            'password' => ['nullable', 'string', 'min:8', 'max:72', 'confirmed'],

            'mark_as_verified' => ['nullable', 'boolean'],

            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],

            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}
