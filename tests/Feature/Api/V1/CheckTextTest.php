<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CheckTextTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_returns_401(): void
    {
        $response = $this->postJson('/api/v1/check-text', ['text' => 'Hello']);

        $response->assertUnauthorized();
    }

    public function test_returns_matches(): void
    {
        Http::fake([
            'languagetool:8010/*' => Http::response([
                'matches' => [
                    ['message' => 'Spelling error', 'rule' => ['id' => 'TEST']],
                ],
            ]),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/check-text', ['text' => 'Ths is wrong']);

        $response->assertOk()
            ->assertJsonCount(1, 'matches');
    }

    public function test_validates_text_required(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/check-text', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('text');
    }

    public function test_accepts_optional_language(): void
    {
        Http::fake([
            'languagetool:8010/*' => Http::response(['matches' => []]),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/check-text', ['text' => 'Bonjour', 'language' => 'fr']);

        $response->assertOk();
        Http::assertSent(fn($r) => $r['language'] === 'fr');
    }
}
