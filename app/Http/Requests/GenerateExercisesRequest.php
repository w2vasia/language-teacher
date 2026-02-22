<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateExercisesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => 'required|exists:error_categories,slug',
            'count' => 'sometimes|integer|min:1|max:10',
        ];
    }
}
