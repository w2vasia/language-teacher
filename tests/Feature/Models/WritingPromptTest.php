<?php

namespace Tests\Feature\Models;

use App\Models\WritingPrompt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WritingPromptTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_writing_prompt(): void
    {
        $prompt = WritingPrompt::factory()->create();

        $this->assertDatabaseHas('writing_prompts', ['id' => $prompt->id]);
    }

    public function test_seeder_creates_prompts(): void
    {
        $this->seed(\Database\Seeders\WritingPromptSeeder::class);

        $this->assertDatabaseCount('writing_prompts', 20);
        $this->assertEquals(4, WritingPrompt::distinct('category')->count('category'));
    }

    public function test_has_many_text_submissions(): void
    {
        $prompt = \App\Models\WritingPrompt::factory()->create();
        $user = \App\Models\User::factory()->create();
        $sub = \App\Models\TextSubmission::factory()->create([
            'user_id' => $user->id,
            'writing_prompt_id' => $prompt->id,
        ]);

        $this->assertTrue($prompt->textSubmissions->contains($sub));
    }

    public function test_text_submission_belongs_to_writing_prompt(): void
    {
        $prompt = \App\Models\WritingPrompt::factory()->create();
        $user = \App\Models\User::factory()->create();
        $sub = \App\Models\TextSubmission::factory()->create([
            'user_id' => $user->id,
            'writing_prompt_id' => $prompt->id,
        ]);

        $this->assertEquals($prompt->id, $sub->writingPrompt->id);
    }
}
