<?php

namespace App\Http\Controllers;

use App\Services\ErrorAnalysisService;
use App\Services\ProgressTrackerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsPageController extends Controller
{
    public function __invoke(
        Request $request,
        ProgressTrackerService $progressTracker,
        ErrorAnalysisService $errorAnalysis,
    ): Response {
        $user = $request->user();

        return Inertia::render('Analytics', [
            'stats' => $progressTracker->getDashboardStats($user),
            'weakAreas' => $progressTracker->getWeakAreas($user),
            'errorSummary' => $errorAnalysis->getErrorSummary($user),
        ]);
    }
}
