<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WritingPromptResource;
use App\Models\WritingPrompt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WritingPromptController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = WritingPrompt::query();

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($difficulty = $request->query('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        return WritingPromptResource::collection($query->orderBy('category')->orderBy('difficulty')->get());
    }
}
