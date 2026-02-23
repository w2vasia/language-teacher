<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExplainErrorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => 'required|string|max:5000',
            'context' => 'required|string|max:5000',
            'category' => 'required|string|max:100',
            'rule_id' => 'sometimes|nullable|string|max:200',
            'replacement' => 'sometimes|nullable|string|max:1000',
        ];
    }
}
