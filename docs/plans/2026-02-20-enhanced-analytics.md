# Enhanced Analytics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add time range selection, period-over-period comparison, and error-rate-per-100-words trend to Analytics and Dashboard pages.

**Architecture:** Extend `ProgressTrackerService` with period-aware query methods. Add a `period` query param to the Analytics Inertia page controller and API endpoints. Frontend gets a range selector + comparison arrows on stat cards. No new models or migrations.

**Tech Stack:** Laravel 12, Inertia v2, React 18, Tailwind v3, PHPUnit

---

### Task 1: Extend ProgressTrackerService — period-aware stats

**Files:**
- Modify: `app/Services/ProgressTrackerService.php`
- Test: `tests/Unit/Services/ProgressTrackerServiceTest.php`

**Step 1: Write failing tests for `getDashboardStats` with date range + comparison**

Add these tests to `tests/Unit/Services/ProgressTrackerServiceTest.php`:

```php
public function test_get_dashboard_stats_with_days_param(): void
{
    $user = User::factory()->create();
    $sub = TextSubmission::factory()->create([
        'user_id' => $user->id,
        'original_text' => 'one two three',
        'created_at' => now()->subDays(5),
    ]);
    Error::factory()->count(2)->create([
        'text_submission_id' => $sub->id,
        'created_at' => now()->subDays(5),
    ]);

    // Old submission outside 3-day window
    $oldSub = TextSubmission::factory()->create([
        'user_id' => $user->id,
        'original_text' => 'old text here today',
        'created_at' => now()->subDays(10),
    ]);
    Error::factory()->count(4)->create([
        'text_submission_id' => $oldSub->id,
        'created_at' => now()->subDays(10),
    ]);

    $stats = $this->service->getDashboardStats($user, 7);

    $this->assertEquals(1, $stats['total_submissions']);
    $this->assertEquals(2, $stats['total_errors']);
    $this->assertEquals(3, $stats['total_words_checked']);
}

public function test_get_dashboard_stats_includes_previous_period(): void
{
    $user = User::factory()->create();

    // Current period (last 7 days): 1 submission, 2 errors
    $sub = TextSubmission::factory()->create([
        'user_id' => $user->id,
        'original_text' => 'one two three',
        'created_at' => now()->subDays(2),
    ]);
    Error::factory()->count(2)->create([
        'text_submission_id' => $sub->id,
        'created_at' => now()->subDays(2),
    ]);

    // Previous period (7-14 days ago): 1 submission, 5 errors
    $prevSub = TextSubmission::factory()->create([
        'user_id' => $user->id,
        'original_text' => 'four five six seven eight',
        'created_at' => now()->subDays(10),
    ]);
    Error::factory()->count(5)->create([
        'text_submission_id' => $prevSub->id,
        'created_at' => now()->subDays(10),
    ]);

    $stats = $this->service->getDashboardStats($user, 7);

    $this->assertArrayHasKey('previous', $stats);
    $this->assertEquals(5, $stats['previous']['total_errors']);
    $this->assertEquals(1, $stats['previous']['total_submissions']);
}

public function test_get_dashboard_stats_null_days_returns_all_time(): void
{
    $user = User::factory()->create();
    $sub = TextSubmission::factory()->create([
        'user_id' => $user->id,
        'original_text' => 'hello world',
        'created_at' => now()->subDays(100),
    ]);
    Error::factory()->count(3)->create([
        'text_submission_id' => $sub->id,
        'created_at' => now()->subDays(100),
    ]);

    $stats = $this->service->getDashboardStats($user, null);

    $this->assertEquals(1, $stats['total_submissions']);
    $this->assertEquals(3, $stats['total_errors']);
    $this->assertArrayNotHasKey('previous', $stats);
}
```

**Step 2: Run tests to verify they fail**

Run: `vendor/bin/sail artisan test --compact --filter=test_get_dashboard_stats_with_days_param`
Run: `vendor/bin/sail artisan test --compact --filter=test_get_dashboard_stats_includes_previous_period`
Run: `vendor/bin/sail artisan test --compact --filter=test_get_dashboard_stats_null_days_returns_all_time`
Expected: FAIL (signature mismatch or wrong counts)

**Step 3: Implement period-aware `getDashboardStats`**

Replace `getDashboardStats` in `app/Services/ProgressTrackerService.php`:

```php
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
        'error_trend' => $this->getErrorTrend($user, $days ?? 30),
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
        ->where('created_at', '>=', $previousStart)
        ->where('created_at', '<', $currentStart);

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
```

**Step 4: Fix existing test — add days param**

The existing `test_get_dashboard_stats_calculates_correctly` passes `$user` only. It should still work because `days` defaults to `7` and factory-created submissions default to `now()`. Verify by running:

Run: `vendor/bin/sail artisan test --compact tests/Unit/Services/ProgressTrackerServiceTest.php`
Expected: ALL PASS

**Step 5: Commit**

```
feat: add period-aware stats + comparison to ProgressTrackerService
```

---

### Task 2: Add error-rate-per-100-words to trend data

**Files:**
- Modify: `app/Services/ProgressTrackerService.php`
- Test: `tests/Unit/Services/ProgressTrackerServiceTest.php`

**Step 1: Write failing test**

Add to `tests/Unit/Services/ProgressTrackerServiceTest.php`:

```php
public function test_get_error_trend_includes_error_rate(): void
{
    $user = User::factory()->create();
    $submission = TextSubmission::factory()->create([
        'user_id' => $user->id,
        'original_text' => str_repeat('word ', 50), // 50 words
        'created_at' => now(),
    ]);
    Error::factory()->count(5)->create([
        'text_submission_id' => $submission->id,
        'created_at' => now(),
    ]);

    $trend = $this->service->getErrorTrend($user, 7);

    $todayEntry = collect($trend)->firstWhere('date', now()->toDateString());
    $this->assertArrayHasKey('error_rate', $todayEntry);
    $this->assertEquals(10.0, $todayEntry['error_rate']); // 5 errors / 50 words * 100
}

public function test_get_error_trend_rate_zero_when_no_words(): void
{
    $user = User::factory()->create();
    $trend = $this->service->getErrorTrend($user, 7);

    $todayEntry = collect($trend)->firstWhere('date', now()->toDateString());
    $this->assertEquals(0, $todayEntry['error_rate']);
}
```

**Step 2: Run tests to verify they fail**

Run: `vendor/bin/sail artisan test --compact --filter=test_get_error_trend_includes_error_rate`
Expected: FAIL (no `error_rate` key)

**Step 3: Update `getErrorTrend` to include word counts + error rate**

Replace `getErrorTrend` in `app/Services/ProgressTrackerService.php`:

```php
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
```

**Step 4: Run all service tests**

Run: `vendor/bin/sail artisan test --compact tests/Unit/Services/ProgressTrackerServiceTest.php`
Expected: ALL PASS

**Step 5: Commit**

```
feat: add error_rate per 100 words to trend data
```

---

### Task 3: Update Analytics page controller to accept period param

**Files:**
- Modify: `app/Http/Controllers/AnalyticsPageController.php`
- Modify: `app/Http/Controllers/Api/V1/AnalyticsController.php`
- Test: `tests/Feature/AnalyticsPageTest.php`
- Test: `tests/Feature/Api/V1/AnalyticsTest.php`

**Step 1: Write failing tests**

Add to `tests/Feature/AnalyticsPageTest.php`:

```php
public function test_analytics_accepts_days_param(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/analytics?days=30');

    $response->assertOk();
    $response->assertInertia(fn($page) => $page
        ->component('Analytics')
        ->has('stats')
        ->has('stats.previous')
        ->where('days', 30)
    );
}

public function test_analytics_all_time_has_no_previous(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/analytics?days=all');

    $response->assertOk();
    $response->assertInertia(fn($page) => $page
        ->component('Analytics')
        ->where('days', null)
        ->has('stats', fn($stats) => $stats
            ->missing('previous')
            ->etc()
        )
    );
}

public function test_analytics_rejects_invalid_days(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/analytics?days=999');

    $response->assertRedirect();
}
```

Add to `tests/Feature/Api/V1/AnalyticsTest.php`:

```php
public function test_dashboard_accepts_days_param(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/analytics/dashboard?days=30');

    $response->assertOk()
        ->assertJsonStructure(['previous']);
}
```

**Step 2: Run tests to verify they fail**

Run: `vendor/bin/sail artisan test --compact --filter=test_analytics_accepts_days_param`
Expected: FAIL

**Step 3: Update controllers**

`app/Http/Controllers/AnalyticsPageController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Services\ErrorAnalysisService;
use App\Services\ProgressTrackerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsPageController extends Controller
{
    private const ALLOWED_DAYS = [7, 30, 90];

    public function __invoke(
        Request $request,
        ProgressTrackerService $progressTracker,
        ErrorAnalysisService $errorAnalysis,
    ): Response {
        $user = $request->user();
        $days = $this->parseDays($request);

        return Inertia::render('Analytics', [
            'stats' => $progressTracker->getDashboardStats($user, $days),
            'weakAreas' => $progressTracker->getWeakAreas($user),
            'errorSummary' => $errorAnalysis->getErrorSummary($user),
            'days' => $days,
        ]);
    }

    private function parseDays(Request $request): ?int
    {
        $raw = $request->query('days', '7');

        if ($raw === 'all') {
            return null;
        }

        $days = (int) $raw;

        if (! in_array($days, self::ALLOWED_DAYS, true)) {
            abort(302, '', ['Location' => route('analytics', ['days' => 7])]);
        }

        return $days;
    }
}
```

`app/Http/Controllers/Api/V1/AnalyticsController.php` — update `dashboard` method:

```php
public function dashboard(Request $request, ProgressTrackerService $service): JsonResponse
{
    $days = $request->query('days');
    $parsedDays = $days === 'all' ? null : (int) ($days ?? 7);

    return response()->json($service->getDashboardStats($request->user(), $parsedDays));
}
```

**Step 4: Run all feature tests**

Run: `vendor/bin/sail artisan test --compact tests/Feature/AnalyticsPageTest.php`
Run: `vendor/bin/sail artisan test --compact tests/Feature/Api/V1/AnalyticsTest.php`
Expected: ALL PASS

**Step 5: Commit**

```
feat: add days query param to analytics controllers
```

---

### Task 4: Update Analytics page — time range selector + comparison arrows

**Files:**
- Modify: `resources/js/Pages/Analytics.tsx`

**Step 1: Update TypeScript interfaces and add range selector + comparison StatCard**

Replace full contents of `resources/js/Pages/Analytics.tsx`. Key changes:

1. Add `previous` to `Stats` interface (optional)
2. Add `days` prop (number | null)
3. Add `RangeSelector` component — 4 buttons (7d/30d/90d/All), uses `router.get` to navigate with `?days=` preserving scroll
4. Update `StatCard` to accept optional `previousValue` — when present, show a small green down-arrow + percentage if current < previous (fewer errors = good), red up-arrow if worse, gray dash if same
5. Update `TrendChart` — add an `error_rate` line or second bar color. For MVP: switch chart to show `error_rate` with a toggle, or show both bars. Simplest: show error_rate as a separate small chart below.

```tsx
// Key new/modified components:

interface Stats {
    total_submissions: number;
    total_errors: number;
    total_words_checked: number;
    errors_per_submission: number;
    error_trend: ErrorTrend[];
    previous?: {
        total_submissions: number;
        total_errors: number;
        total_words_checked: number;
        errors_per_submission: number;
    };
}

interface ErrorTrend {
    date: string;
    error_count: number;
    word_count: number;
    error_rate: number;
}

interface Props {
    stats: Stats;
    weakAreas: WeakArea[];
    errorSummary: Record<string, number>;
    days: number | null;
}
```

For the `RangeSelector`:

```tsx
import { router } from '@inertiajs/react';

function RangeSelector({ days }: { days: number | null }) {
    const options = [
        { label: '7d', value: 7 },
        { label: '30d', value: 30 },
        { label: '90d', value: 90 },
        { label: 'All', value: 'all' },
    ] as const;

    return (
        <div className="flex gap-1 rounded-xl bg-amber-100/50 p-1">
            {options.map((opt) => {
                const isActive = opt.value === (days ?? 'all');
                return (
                    <button
                        key={opt.label}
                        onClick={() => router.get('/analytics', { days: opt.value }, { preserveState: true, preserveScroll: true })}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-white text-amber-900 shadow-sm'
                                : 'text-amber-700/60 hover:text-amber-800'
                        }`}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
```

For comparison arrows in `StatCard`:

```tsx
function StatCard({ label, value, previousValue }: {
    label: string;
    value: string | number;
    previousValue?: number;
}) {
    const current = typeof value === 'number' ? value : parseFloat(value);
    const diff = previousValue !== undefined && previousValue > 0
        ? Math.round(((current - previousValue) / previousValue) * 100)
        : null;

    return (
        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6">
            <dt className="text-sm font-medium text-amber-700/60">{label}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-3xl text-amber-950">{value}</span>
                {diff !== null && diff !== 0 && (
                    <span className={`text-sm font-medium ${diff < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {diff < 0 ? '\u2193' : '\u2191'} {Math.abs(diff)}%
                    </span>
                )}
            </dd>
        </div>
    );
}
```

Note on comparison arrow color logic: for "Total Errors" and "Errors/Submission", a decrease is good (green). For "Submissions" and "Words Checked", an increase is good (green). Add an `invertColor` prop:

```tsx
function StatCard({ label, value, previousValue, invertColor = false }: {
    label: string;
    value: string | number;
    previousValue?: number;
    invertColor?: boolean;
}) {
    // ... calculate diff ...
    // When invertColor is true: increase = green, decrease = red (for submissions/words)
    // When invertColor is false (default): decrease = green, increase = red (for errors)
    const isPositive = invertColor ? diff > 0 : diff < 0;
    // ...color: isPositive ? 'text-emerald-600' : 'text-rose-600'
}
```

For the error rate trend chart, add alongside the existing trend chart:

```tsx
function ErrorRateChart({ data }: { data: ErrorTrend[] }) {
    const max = Math.max(...data.map((d) => d.error_rate), 1);

    return (
        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6">
            <h3 className="mb-4 text-sm font-medium text-amber-700/60">
                Errors per 100 Words
            </h3>
            <div className="flex items-end gap-1" style={{ height: 150 }}>
                {data.map((d) => (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                        <div
                            className="w-full rounded-t bg-violet-400 transition-all duration-300"
                            style={{
                                height: `${(d.error_rate / max) * 100}%`,
                                minHeight: d.error_rate > 0 ? 4 : 0,
                            }}
                        />
                        <span className="text-xs text-amber-600/40">{d.date.slice(5)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

Wire it all together in the default export: place `RangeSelector` next to the header, pass `previousValue` to each `StatCard`, add `ErrorRateChart` in the charts grid.

**Step 2: Build frontend to check for TS errors**

Run: `vendor/bin/sail npm run build`
Expected: BUILD SUCCESS

**Step 3: Run existing analytics tests to confirm no regressions**

Run: `vendor/bin/sail artisan test --compact tests/Feature/AnalyticsPageTest.php`
Expected: ALL PASS

**Step 4: Commit**

```
feat: analytics page — range selector, comparison arrows, error rate chart
```

---

### Task 5: Update Dashboard page — comparison arrows on stat cards

**Files:**
- Modify: `resources/js/Pages/Dashboard.tsx`
- Modify: `app/Http/Controllers/DashboardController.php`
- Test: `tests/Feature/DashboardPageTest.php`

**Step 1: Write failing test**

Add to `tests/Feature/DashboardPageTest.php`:

```php
public function test_dashboard_stats_include_previous_period(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn($page) => $page
        ->component('Dashboard')
        ->has('stats.previous')
    );
}
```

**Step 2: Run test to verify it fails**

Run: `vendor/bin/sail artisan test --compact --filter=test_dashboard_stats_include_previous_period`
Expected: FAIL

**Step 3: Dashboard controller already passes `getDashboardStats($user)` which now defaults to 7 days and includes `previous`. No controller changes needed — the test should actually pass after Task 1.**

Verify: run the test again. If it passes, skip to frontend update.

**Step 4: Update `Dashboard.tsx`**

- Import same `StatCard` pattern with `previousValue` + `invertColor` (or extract a shared component — but for MVP, duplicate the StatCard with the arrow logic in Dashboard.tsx since both pages already have their own copy)
- Add `previous` to the `Stats` interface
- Pass `previousValue` to each StatCard
- Update the `MiniBarChart` label from "7-Day Error Trend" to "Error Trend" (it's always 7d on dashboard)

**Step 5: Build + test**

Run: `vendor/bin/sail npm run build`
Run: `vendor/bin/sail artisan test --compact tests/Feature/DashboardPageTest.php`
Expected: ALL PASS

**Step 6: Commit**

```
feat: dashboard — comparison arrows on stat cards
```

---

### Task 6: Run Pint + full test suite

**Step 1: Run Pint on modified PHP files**

Run: `vendor/bin/sail bin pint --dirty --format agent`
Expected: All files pass or get auto-fixed

**Step 2: Run full test suite**

Run: `vendor/bin/sail artisan test --compact`
Expected: ALL PASS

**Step 3: Commit any Pint fixes**

```
style: pint formatting
```
