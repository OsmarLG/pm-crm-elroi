<?php

namespace App\Http\Requests\Notes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FolderStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('folders', 'id')->where(
                    fn($q) =>
                    $q->where('user_id', auth()->id())
                ),
            ],
        ];
    }
}
