<?php

namespace Tests\Unit\Services;

use App\Models\Error;
use App\Models\ErrorCategory;
use App\Models\TextSubmission;
use App\Models\User;
use App\Services\ProgressTrackerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressTrackerServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProgressTrackerService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\ErrorCategorySeeder::class);
        $this->service = new ProgressTrackerService();
    }

    public function test_get_dashboard_stats_for_empty_user(): void
    {
        $user = User::factory()->create();
        $stats = $this->service->getDashboardStats($user);

        $this->assertEquals(0, $stats['total_submissions']);
        $this->assertEquals(0, $stats['total_errors']);
        $this->assertEquals(0, $stats['total_words_checked']);
        $this->assertEquals(0, $stats['errors_per_submission']);
    }

    public function test_get_dashboard_stats_calculates_correctly(): void
    {
        $user = User::factory()->create();
        $sub1 = TextSubmission::factory()->create(['user_id' => $user->id, 'original_text' => 'one two three']);
        $sub2 = TextSubmission::factory()->create(['user_id' => $user->id, 'original_text' => 'four five']);

        Error::factory()->count(3)->create(['text_submission_id' => $sub1->id]);
        Error::factory()->count(1)->create(['text_submission_id' => $sub2->id]);

        $stats = $this->service->getDashboardStats($user);

        $this->assertEquals(2, $stats['total_submissions']);
        $this->assertEquals(4, $stats['total_errors']);
        $this->assertEquals(5, $stats['total_words_checked']);
        $this->assertEquals(2.0, $stats['errors_per_submission']);
    }

    public function test_get_weak_areas_returns_sorted(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);

        $grammar = ErrorCategory::where('slug', 'grammar')->first();
        $spelling = ErrorCategory::where('slug', 'spelling')->first();

        Error::factory()->count(5)->create(['text_submission_id' => $submission->id, 'error_category_id' => $spelling->id]);
        Error::factory()->count(3)->create(['text_submission_id' => $submission->id, 'error_category_id' => $grammar->id]);

        $weakAreas = $this->service->getWeakAreas($user, 5);

        $this->assertEquals('spelling', $weakAreas[0]['slug']);
        $this->assertEquals(5, $weakAreas[0]['count']);
        $this->assertEquals('grammar', $weakAreas[1]['slug']);
    }

    public function test_get_error_trend_returns_daily_counts(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create([
            'user_id' => $user->id,
            'created_at' => now(),
        ]);
        Error::factory()->count(2)->create([
            'text_submission_id' => $submission->id,
            'created_at' => now(),
        ]);

        $trend = $this->service->getErrorTrend($user, 7);

        $this->assertCount(7, $trend);
        $todayEntry = collect($trend)->firstWhere('date', now()->toDateString());
        $this->assertEquals(2, $todayEntry['error_count']);
    }
}
