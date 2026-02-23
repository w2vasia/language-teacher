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

    public function test_old_analytics_url_redirects_to_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/analytics')
            ->assertRedirect('/dashboard');
    }

    public function test_dashboard_requires_auth(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_dashboard_renders_with_analytics_props(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats')
            ->has('weakAreas')
            ->has('topicsToReview')
            ->has('errorSummary')
        );
    }

    public function test_dashboard_accepts_days_param(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard?days=30');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats')
            ->has('stats.previous')
            ->where('days', 30)
        );
    }

    public function test_dashboard_all_time_has_no_previous(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard?days=all');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('days', null)
            ->has('stats', fn ($stats) => $stats
                ->missing('previous')
                ->etc()
            )
        );
    }

    public function test_dashboard_rejects_invalid_days(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard?days=999');

        $response->assertRedirect();
    }

    public function test_dashboard_returns_topics_with_errors(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->count(2)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
        ]);

        $response = $this->actingAs($user)->get('/dashboard?days=7');

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

    public function test_dashboard_empty_topics_when_no_errors(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('topicsToReview', 0)
        );
    }
}
