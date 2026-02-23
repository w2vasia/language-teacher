<?php

namespace Tests\Feature\Api\V1;

use App\Contracts\TranslationDriver;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TextAnalysisTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\ErrorCategorySeeder::class);

        $this->app->instance(TranslationDriver::class, new class implements TranslationDriver
        {
            public function translate(string $text, string $from, string $to): string
            {
                return 'translated: '.$text;
            }
        });
    }

    public function test_unauthenticated_returns_401(): void
    {
        $this->postJson('/api/v1/text/analyze', ['text' => 'Hello'])
            ->assertUnauthorized();
    }

    public function test_analyzes_and_stores_submission(): void
    {
        Http::fake([
            'languagetool:8010/*' => Http::response([
                'matches' => [
                    [
                        'message' => 'Spelling mistake',
                        'context' => ['text' => 'Ths is wrong', 'offset' => 0, 'length' => 3],
                        'offset' => 0,
                        'length' => 3,
                        'replacements' => [['value' => 'This']],
                        'rule' => [
                            'id' => 'MORFOLOGIK_RULE',
                            'description' => 'Spelling',
                            'category' => ['id' => 'TYPOS'],
                        ],
                    ],
                ],
            ]),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/text/analyze', ['text' => 'Ths is wrong']);

        $response->assertCreated()
            ->assertJsonStructure(['submission', 'errors', 'matches', 'translation']);

        $this->assertDatabaseHas('text_submissions', [
            'user_id' => $user->id,
            'original_text' => 'Ths is wrong',
        ]);
        $this->assertDatabaseHas('errors', ['message' => 'Spelling mistake']);
    }

    public function test_stores_translation_in_submission(): void
    {
        Http::fake(['*' => Http::response(['matches' => []])]);

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/text/analyze', ['text' => 'Hello world']);

        $response->assertCreated()
            ->assertJsonPath('translation', 'translated: Hello world');

        $this->assertDatabaseHas('text_submissions', [
            'user_id' => $user->id,
            'translated_text' => 'translated: Hello world',
        ]);
    }

    public function test_validates_text_required(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/text/analyze', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('text');
    }

    public function test_analyze_accepts_writing_prompt_id(): void
    {
        $user = User::factory()->create();
        $prompt = \App\Models\WritingPrompt::factory()->create();

        Http::fake(['*' => Http::response(['matches' => []])]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/text/analyze', [
                'text' => 'This is a test sentence for the prompt.',
                'writing_prompt_id' => $prompt->id,
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('text_submissions', [
            'user_id' => $user->id,
            'writing_prompt_id' => $prompt->id,
        ]);
    }

    public function test_analyze_works_without_writing_prompt_id(): void
    {
        $user = User::factory()->create();

        Http::fake(['*' => Http::response(['matches' => []])]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/text/analyze', [
                'text' => 'Just a regular text check.',
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('text_submissions', [
            'user_id' => $user->id,
            'writing_prompt_id' => null,
        ]);
    }

    public function test_analyze_rejects_invalid_writing_prompt_id(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/text/analyze', [
                'text' => 'Some text here.',
                'writing_prompt_id' => 99999,
            ]);

        $response->assertUnprocessable();
    }
}
