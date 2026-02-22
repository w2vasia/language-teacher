<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exercise' => 'required|array',
            'exercise.type' => 'required|string|in:fix_the_sentence,multiple_choice,fill_in_the_blank',
            'exercise.instruction' => 'required|string|max:2000',
            'exercise.sentence' => 'sometimes|nullable|string|max:2000',
            'exercise.options' => 'sometimes|nullable|array|max:10',
            'exercise.options.*' => 'string|max:500',
            'exercise.correct_answer' => 'sometimes|nullable|string|max:2000',
            'exercise.correct_index' => 'sometimes|nullable|integer',
            'user_answer' => 'required|string|max:2000',
        ];
    }
}
