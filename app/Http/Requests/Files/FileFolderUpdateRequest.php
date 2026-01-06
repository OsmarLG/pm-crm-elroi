<?php

namespace App\Http\Requests\Files;

use Illuminate\Foundation\Http\FormRequest;

class FileFolderUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('folders_files.manage');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'parent_id' => ['nullable', 'integer', 'exists:file_folders,id'],
        ];
    }
}
