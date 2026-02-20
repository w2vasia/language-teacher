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
        $response->assertInertia(fn($page) => $page
            ->component('Analytics')
            ->has('stats')
            ->has('weakAreas')
            ->has('errorSummary')
        );
    }
}
