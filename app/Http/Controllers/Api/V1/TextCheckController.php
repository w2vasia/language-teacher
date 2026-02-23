<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckTextRequest;
use App\Services\LanguageToolService;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;

class TextCheckController extends Controller
{
    public function __invoke(
        CheckTextRequest $request,
        LanguageToolService $languageTool,
        TranslationService $translation,
    ): JsonResponse {
        $text = $request->validated('text');

        $matches = $languageTool->check($text, $request->validated('language'));
        $translatedText = $translation->translate($text);

        return response()->json([
            'matches' => $matches,
            'translation' => $translatedText,
        ]);
    }
}
