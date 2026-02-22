<?php

namespace Tests\Feature\Api\V1;

use App\Ai\Agents\ErrorExplainer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorExplainTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_returns_401(): void
    {
        $response = $this->postJson('/api/v1/errors/explain', [
            'message' => 'Spelling error',
            'context' => 'Ths is wrong',
            'category' => 'spelling',
        ]);

        $response->assertUnauthorized();
    }

    public function test_returns_explanation(): void
    {
        ErrorExplainer::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/errors/explain', [
                'message' => 'Possible spelling mistake found.',
                'context' => 'Ths is a test sentence.',
                'category' => 'spelling',
            ]);

        $response->assertOk()
            ->assertJsonStructure([
                'explanation',
                'incorrect_example',
                'correct_example',
            ]);

        ErrorExplainer::assertPrompted(fn ($prompt) => $prompt->contains('Possible spelling mistake'));
    }

    public function test_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/errors/explain', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['message', 'context', 'category']);
    }

    public function test_accepts_optional_fields(): void
    {
        ErrorExplainer::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/errors/explain', [
                'message' => 'Wrong article',
                'context' => 'I have a apple.',
                'category' => 'grammar',
                'rule_id' => 'EN_A_VS_AN',
                'replacement' => 'an',
            ]);

        $response->assertOk();

        ErrorExplainer::assertPrompted(fn ($prompt) => $prompt->contains('EN_A_VS_AN') && $prompt->contains('replacement: an'));
    }
}
