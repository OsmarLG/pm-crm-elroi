<?php

namespace App\Http\Requests\Notes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NoteUpdateRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'content' => ['nullable', 'string'],
            'visibility' => ['sometimes', 'string', 'in:private,public'],
            'folder_id' => [
                'nullable',
                'integer',
                Rule::exists('folders', 'id')->where(fn ($q) =>
                    $q->where('user_id', auth()->id())
                ),
            ],
        ];
    }
}