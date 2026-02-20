<?php

namespace Tests\Feature\Api\V1;

use App\Models\Error;
use App\Models\TextSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\ErrorCategorySeeder::class);
    }

    public function test_dashboard_returns_stats(): void
    {
        $user = User::factory()->create();
        $sub = TextSubmission::factory()->create(['user_id' => $user->id]);
        Error::factory()->count(2)->create(['text_submission_id' => $sub->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/analytics/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'total_submissions',
                'total_errors',
                'total_words_checked',
                'errors_per_submission',
                'error_trend',
            ]);

        $this->assertEquals(1, $response->json('total_submissions'));
        $this->assertEquals(2, $response->json('total_errors'));
    }

    public function test_weak_areas_returns_sorted(): void
    {
        $user = User::factory()->create();
        $sub = TextSubmission::factory()->create(['user_id' => $user->id]);

        $grammar = \App\Models\ErrorCategory::where('slug', 'grammar')->first();
        Error::factory()->count(3)->create([
            'text_submission_id' => $sub->id,
            'error_category_id' => $grammar->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/analytics/weak-areas');

        $response->assertOk();
        $this->assertEquals('grammar', $response->json('0.slug'));
    }

    public function test_unauthenticated_returns_401(): void
    {
        $this->getJson('/api/v1/analytics/dashboard')->assertUnauthorized();
        $this->getJson('/api/v1/analytics/weak-areas')->assertUnauthorized();
    }
}
