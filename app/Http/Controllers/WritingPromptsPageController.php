<?php

namespace App\Http\Controllers;

use App\Models\WritingPrompt;
use Inertia\Inertia;
use Inertia\Response;

class WritingPromptsPageController extends Controller
{
    public function index(): Response
    {
        $prompts = WritingPrompt::query()
            ->orderBy('category')
            ->orderBy('difficulty')
            ->get()
            ->groupBy('category');

        return Inertia::render('WritingPrompts/Index', [
            'promptsByCategory' => $prompts,
        ]);
    }

    public function show(WritingPrompt $writingPrompt): Response
    {
        return Inertia::render('WritingPrompts/Show', [
            'prompt' => $writingPrompt,
        ]);
    }
}
