<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

class ProgressTrackerService
{
    private const DEFAULT_TREND_DAYS = 30;

    public function getDashboardStats(User $user, ?int $days = 7): array
    {
        $submissionsQuery = $user->textSubmissions();
        $errorsQuery = $user->errors();

        if ($days !== null) {
            $since = Carbon::today()->subDays($days - 1);
            $submissionsQuery->where('text_submissions.created_at', '>=', $since);
            $errorsQuery->where('errors.created_at', '>=', $since);
        }

        $totalSubmissions = $submissionsQuery->count();
        $totalErrors = $errorsQuery->count();
        $totalWords = (int) $submissionsQuery->sum('word_count');

        $stats = [
            'total_submissions' => $totalSubmissions,
            'total_errors' => $totalErrors,
            'total_words_checked' => $totalWords,
            'errors_per_submission' => $totalSubmissions > 0
                ? round($totalErrors / $totalSubmissions, 1)
                : 0,
            'error_trend' => $this->getErrorTrend($user, $days ?? self::DEFAULT_TREND_DAYS),
        ];

        if ($days !== null) {
            $stats['previous'] = $this->getPreviousPeriodStats($user, $days);
        }

        return $stats;
    }

    private function getPreviousPeriodStats(User $user, int $days): array
    {
        $currentStart = Carbon::today()->subDays($days - 1);
        $previousStart = $currentStart->copy()->subDays($days);

        $submissions = $user->textSubmissions()
            ->where('text_submissions.created_at', '>=', $previousStart)
            ->where('text_submissions.created_at', '<', $currentStart);

        $errors = $user->errors()
            ->where('errors.created_at', '>=', $previousStart)
            ->where('errors.created_at', '<', $currentStart);

        $totalSubmissions = $submissions->count();
        $totalErrors = $errors->count();
        $totalWords = (int) $submissions->sum('word_count');

        return [
            'total_submissions' => $totalSubmissions,
            'total_errors' => $totalErrors,
            'total_words_checked' => $totalWords,
            'errors_per_submission' => $totalSubmissions > 0
                ? round($totalErrors / $totalSubmissions, 1)
                : 0,
        ];
    }

    public function getWeakAreas(User $user, int $limit = 5): array
    {
        return \App\Models\Error::where('user_id', $user->id)
            ->join('error_categories', 'errors.error_category_id', '=', 'error_categories.id')
            ->selectRaw('error_categories.name, error_categories.slug, count(*) as count')
            ->groupBy('error_categories.name', 'error_categories.slug')
            ->orderByDesc('count')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getErrorTrend(User $user, int $days = 30): array
    {
        $startDate = Carbon::today()->subDays($days - 1);

        $dailyCounts = $user->errors()
            ->where('errors.created_at', '>=', $startDate)
            ->selectRaw('DATE(errors.created_at) as date, count(*) as error_count')
            ->groupBy('date')
            ->pluck('error_count', 'date')
            ->toArray();

        $dailyWords = $user->textSubmissions()
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, sum(word_count) as words')
            ->groupBy('date')
            ->pluck('words', 'date')
            ->toArray();

        $trend = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->toDateString();
            $errors = $dailyCounts[$date] ?? 0;
            $words = (int) ($dailyWords[$date] ?? 0);
            $trend[] = [
                'date' => $date,
                'error_count' => $errors,
                'word_count' => $words,
                'error_rate' => $words > 0 ? round($errors / $words * 100, 1) : 0,
            ];
        }

        return $trend;
    }
}
