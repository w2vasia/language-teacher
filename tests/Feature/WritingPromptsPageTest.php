<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WritingPrompt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WritingPromptsPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_index_requires_auth(): void
    {
        $this->get('/writing-prompts')->assertRedirect('/login');
    }

    public function test_index_renders_with_prompts(): void
    {
        $user = User::factory()->create();
        WritingPrompt::factory()->count(3)->create();

        $response = $this->actingAs($user)->get('/writing-prompts');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('WritingPrompts/Index')
            ->has('promptsByCategory')
        );
    }

    public function test_show_renders_prompt(): void
    {
        $user = User::factory()->create();
        $prompt = WritingPrompt::factory()->create();

        $response = $this->actingAs($user)->get("/writing-prompts/{$prompt->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('WritingPrompts/Show')
            ->has('prompt')
            ->where('prompt.id', $prompt->id)
        );
    }
}
