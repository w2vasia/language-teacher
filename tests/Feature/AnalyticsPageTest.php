<?php

namespace Tests\Feature;

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
            ->has('weakAreas')
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
}
