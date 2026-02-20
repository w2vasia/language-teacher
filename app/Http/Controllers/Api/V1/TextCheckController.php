<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckTextRequest;
use App\Services\LanguageToolService;
use Illuminate\Http\JsonResponse;

class TextCheckController extends Controller
{
    public function __invoke(CheckTextRequest $request, LanguageToolService $service): JsonResponse
    {
        $matches = $service->check(
            $request->validated('text'),
            $request->validated('language'),
        );

        return response()->json(['matches' => $matches]);
    }
}
