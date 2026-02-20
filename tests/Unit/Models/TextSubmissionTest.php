<?php

namespace Tests\Unit\Models;

use App\Models\TextSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TextSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_word_count_auto_calculated_on_create(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::create([
            'user_id' => $user->id,
            'original_text' => 'This is a test sentence with seven words',
        ]);

        $this->assertEquals(8, $submission->word_count);
    }

    public function test_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($submission->user->is($user));
    }

    public function test_has_many_errors(): void
    {
        $submission = TextSubmission::factory()->create();

        $this->assertCount(0, $submission->errors);
    }
}
