<?php

namespace Tests\Feature\Api\V1;

use App\Models\Error;
use App\Models\TextSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_returns_401(): void
    {
        $this->getJson('/api/v1/text/errors')->assertUnauthorized();
    }

    public function test_returns_paginated_submissions_with_errors(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        Error::factory()->count(3)->create(['text_submission_id' => $submission->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/text/errors');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'per_page']])
            ->assertJsonCount(1, 'data');

        $this->assertCount(3, $response->json('data.0.errors'));
    }

    public function test_scoped_to_authenticated_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        TextSubmission::factory()->create(['user_id' => $user1->id]);
        TextSubmission::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/v1/text/errors');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
