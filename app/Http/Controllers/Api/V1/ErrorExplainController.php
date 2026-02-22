<?php

namespace App\Http\Controllers\Api\V1;

use App\Ai\Agents\ErrorExplainer;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExplainErrorRequest;
use Illuminate\Http\JsonResponse;
use Laravel\Ai\Exceptions\AiException;

class ErrorExplainController extends Controller
{
    public function __invoke(ExplainErrorRequest $request): JsonResponse
    {
        $data = $request->validated();

        $prompt = "Error: {$data['message']}\nContext: {$data['context']}\nCategory: {$data['category']}";

        if (! empty($data['rule_id'])) {
            $prompt .= "\nRule ID: {$data['rule_id']}";
        }

        if (! empty($data['replacement'])) {
            $prompt .= "\nSuggested replacement: {$data['replacement']}";
        }

        try {
            $response = (new ErrorExplainer)->prompt($prompt);
        } catch (AiException) {
            return response()->json(['message' => 'AI service unavailable. Please try again later.'], 503);
        }

        return response()->json([
            'explanation' => $response['explanation'],
            'incorrect_example' => $response['incorrect_example'],
            'correct_example' => $response['correct_example'],
        ]);
    }
}
