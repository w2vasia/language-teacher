<?php

namespace App\Http\Controllers;

use App\Services\ProgressTrackerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PracticeController extends Controller
{
    public function __invoke(Request $request, ProgressTrackerService $service): Response
    {
        return Inertia::render('Practice', [
            'weakCategories' => $service->getWeakAreas($request->user()),
        ]);
    }
}
