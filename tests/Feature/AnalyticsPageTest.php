<?php

namespace Tests\Feature;

use App\Models\Error;
use App\Models\ErrorCategory;
use App\Models\TextSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\ErrorCategorySeeder::class);
    }

    public function test_analytics_requires_auth(): void
    {
        $this->get('/analytics')->assertRedirect('/login');
    }

    public function test_analytics_renders_with_props(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/analytics');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Analytics')
            ->has('stats')
            ->has('topicsToReview')
            ->has('errorSummary')
        );
    }

    public function test_analytics_accepts_days_param(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/analytics?days=30');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
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
        $response->assertInertia(fn ($page) => $page
            ->component('Analytics')
            ->where('days', null)
            ->has('stats', fn ($stats) => $stats
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

    public function test_analytics_returns_topics_with_errors(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->count(2)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
        ]);

        $response = $this->actingAs($user)->get('/analytics?days=7');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('topicsToReview', 1)
            ->has('topicsToReview.0', fn ($topic) => $topic
                ->where('topic', 'Articles')
                ->where('error_count', 2)
                ->has('trend')
                ->has('change')
                ->has('examples')
                ->has('tip')
                ->has('rules')
            )
        );
    }

    public function test_analytics_empty_topics_when_no_errors(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/analytics');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('topicsToReview', 0)
        );
    }
}
