<?php

namespace App\Http\Controllers\Api\V1;

use App\Ai\Agents\ExerciseChecker;
use App\Ai\Agents\ExerciseGenerator;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckExerciseRequest;
use App\Http\Requests\GenerateExercisesRequest;
use Illuminate\Http\JsonResponse;
use Laravel\Ai\Exceptions\AiException;

class PracticeController extends Controller
{
    public function exercises(GenerateExercisesRequest $request): JsonResponse
    {
        $category = $request->validated('category');
        $count = $request->validated('count', 5);

        try {
            $response = (new ExerciseGenerator)->prompt(
                "Generate {$count} exercises targeting the \"{$category}\" error category."
            );
        } catch (AiException) {
            return response()->json(['message' => 'AI service unavailable. Please try again later.'], 503);
        }

        return response()->json(['exercises' => $response['exercises']]);
    }

    public function check(CheckExerciseRequest $request): JsonResponse
    {
        $data = $request->validated();
        $exercise = $data['exercise'];

        $prompt = "Exercise type: {$exercise['type']}\n"
            ."Instruction: {$exercise['instruction']}\n";

        if (! empty($exercise['sentence'])) {
            $prompt .= "Sentence: {$exercise['sentence']}\n";
        }

        if (! empty($exercise['correct_answer'])) {
            $prompt .= "Correct answer: {$exercise['correct_answer']}\n";
        }

        if (isset($exercise['correct_index']) && ! empty($exercise['options'])) {
            $prompt .= "Correct option: {$exercise['options'][$exercise['correct_index']]}\n";
        }

        $prompt .= "Student's answer: {$data['user_answer']}";

        try {
            $response = (new ExerciseChecker)->prompt($prompt);
        } catch (AiException) {
            return response()->json(['message' => 'AI service unavailable. Please try again later.'], 503);
        }

        return response()->json([
            'correct' => $response['correct'],
            'explanation' => $response['explanation'],
        ]);
    }
}
