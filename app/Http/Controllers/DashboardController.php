<?php

namespace App\Http\Controllers;

use App\Services\ErrorAnalysisService;
use App\Services\GrammarTopicService;
use App\Services\ProgressTrackerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const ALLOWED_DAYS = [7, 30, 90];

    public function __invoke(
        Request $request,
        ProgressTrackerService $progressTracker,
        ErrorAnalysisService $errorAnalysis,
        GrammarTopicService $grammarTopics,
    ): Response|RedirectResponse {
        $days = $this->parseDays($request);

        if ($days === false) {
            return redirect()->route('dashboard', ['days' => 7]);
        }

        $user = $request->user();

        return Inertia::render('Dashboard', [
            'stats' => $progressTracker->getDashboardStats($user, $days),
            'weakAreas' => $progressTracker->getWeakAreas($user),
            'topicsToReview' => $grammarTopics->getTopicsToReview($user, $days),
            'errorSummary' => $errorAnalysis->getErrorSummary($user),
            'days' => $days,
        ]);
    }

    private function parseDays(Request $request): int|false|null
    {
        $raw = $request->query('days', '7');

        if ($raw === 'all') {
            return null;
        }

        $days = (int) $raw;

        if (! in_array($days, self::ALLOWED_DAYS, true)) {
            return false;
        }

        return $days;
    }
}
