<?php

namespace App\Http\Requests\Files;

use Illuminate\Foundation\Http\FormRequest;

class FileStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('files.create');
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:51200'], // 50MB
            'folder_id' => ['nullable', 'integer', 'exists:file_folders,id'],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
