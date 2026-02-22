<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\WritingPrompt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WritingPromptTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_prompts(): void
    {
        $user = User::factory()->create();
        WritingPrompt::factory()->count(5)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/writing-prompts');

        $response->assertOk();
        $this->assertCount(5, $response->json('data'));
    }

    public function test_index_filters_by_category(): void
    {
        $user = User::factory()->create();
        WritingPrompt::factory()->create(['category' => 'ielts']);
        WritingPrompt::factory()->create(['category' => 'general']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/writing-prompts?category=ielts');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('ielts', $response->json('data.0.category'));
    }

    public function test_index_requires_auth(): void
    {
        $this->getJson('/api/v1/writing-prompts')->assertUnauthorized();
    }
}
