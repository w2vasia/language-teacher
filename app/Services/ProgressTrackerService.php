<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

class ProgressTrackerService
{
    public function getDashboardStats(User $user): array
    {
        $totalSubmissions = $user->textSubmissions()->count();
        $totalErrors = $user->errors()->count();
        $totalWords = (int) $user->textSubmissions()->sum('word_count');

        return [
            'total_submissions' => $totalSubmissions,
            'total_errors' => $totalErrors,
            'total_words_checked' => $totalWords,
            'errors_per_submission' => $totalSubmissions > 0
                ? round($totalErrors / $totalSubmissions, 1)
                : 0,
            'error_trend' => $this->getErrorTrend($user, 7),
        ];
    }

    public function getWeakAreas(User $user, int $limit = 5): array
    {
        return \App\Models\Error::whereIn(
                'text_submission_id',
                $user->textSubmissions()->select('id')
            )
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

        $trend = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->toDateString();
            $trend[] = [
                'date' => $date,
                'error_count' => $dailyCounts[$date] ?? 0,
            ];
        }

        return $trend;
    }
}
