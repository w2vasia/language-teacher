<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckTextRequest;
use App\Http\Resources\ErrorResource;
use App\Http\Resources\TextSubmissionResource;
use App\Models\TextSubmission;
use App\Services\ErrorAnalysisService;
use App\Services\LanguageToolService;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TextAnalysisController extends Controller
{
    public function analyze(
        CheckTextRequest $request,
        LanguageToolService $languageTool,
        ErrorAnalysisService $errorAnalysis,
        TranslationService $translation,
    ): JsonResponse {
        $text = $request->validated('text');
        $translatedText = $translation->translate($text);

        $submission = TextSubmission::create([
            'user_id' => $request->user()->id,
            'original_text' => $text,
            'translated_text' => $translatedText,
            'writing_prompt_id' => $request->validated('writing_prompt_id'),
            'checked_at' => now(),
        ]);

        $matches = $languageTool->check($text, $request->validated('language'));
        $errors = $errorAnalysis->storeErrors($submission, $matches);

        return response()->json([
            'submission' => new TextSubmissionResource($submission),
            'errors' => ErrorResource::collection($errors),
            'matches' => $matches,
            'translation' => $translatedText,
        ], 201);
    }

    public function errors(Request $request): AnonymousResourceCollection
    {
        $submissions = $request->user()
            ->textSubmissions()
            ->with('errors.errorCategory')
            ->latest()
            ->paginate(15);

        return TextSubmissionResource::collection($submissions);
    }
}
