<?php

namespace App\Http\Controllers\Api\V1;

use App\Ai\Agents\ExerciseChecker;
use App\Ai\Agents\ExerciseGenerator;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckExerciseRequest;
use App\Http\Requests\GenerateExercisesRequest;
use App\Models\Error;
use App\Models\ErrorCategory;
use App\Models\PracticeSession;
use Illuminate\Http\JsonResponse;
use Laravel\Ai\Exceptions\AiException;

class PracticeController extends Controller
{
    public function exercises(GenerateExercisesRequest $request): JsonResponse
    {
        $category = $request->validated('category');
        $count = $request->validated('count', 5);
        $difficulty = $request->validated('difficulty', 'intermediate');

        try {
            $response = (new ExerciseGenerator)->prompt(
                "Generate {$count} exercises targeting the \"{$category}\" error category at {$difficulty} difficulty level."
            );
        } catch (AiException) {
            return response()->json(['message' => 'AI service unavailable. Please try again later.'], 503);
        }

        $errorCategory = ErrorCategory::where('slug', $category)->first();

        $session = PracticeSession::create([
            'user_id' => $request->user()->id,
            'error_category_id' => $errorCategory->id,
            'difficulty' => $difficulty,
            'total_exercises' => $count,
        ]);

        return response()->json([
            'exercises' => $response['exercises'],
            'session_id' => $session->id,
        ]);
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

        if (! $response['correct'] && $request->has('category')) {
            $category = ErrorCategory::where('slug', $request->validated('category'))->first();
            $sessionId = $request->validated('session_id');

            if ($category) {
                Error::create([
                    'user_id' => $request->user()->id,
                    'text_submission_id' => null,
                    'practice_session_id' => $sessionId,
                    'error_category_id' => $category->id,
                    'message' => $response['explanation'],
                    'context' => $exercise['sentence'] ?? $exercise['instruction'],
                    'offset' => 0,
                    'length' => 0,
                    'replacement_suggestions' => isset($exercise['correct_answer']) ? [$exercise['correct_answer']] : [],
                    'rule_id' => null,
                    'rule_description' => null,
                ]);
            }
        }

        return response()->json([
            'correct' => $response['correct'],
            'explanation' => $response['explanation'],
        ]);
    }
}
