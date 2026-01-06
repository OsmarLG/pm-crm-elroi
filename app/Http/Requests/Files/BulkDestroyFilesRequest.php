<?php

namespace App\Http\Requests\Files;

use Illuminate\Foundation\Http\FormRequest;

class BulkDestroyFilesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('files.delete');
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:files,id'],
        ];
    }
}
