<?php

namespace App\Http\Requests\Files;

use Illuminate\Foundation\Http\FormRequest;

class FileStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('files.create');
    }

    protected function prepareForValidation()
    {
        ini_set('memory_limit', '-1');
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:409600'], // 400MB
            'folder_id' => ['nullable', 'integer', 'exists:file_folders,id'],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
