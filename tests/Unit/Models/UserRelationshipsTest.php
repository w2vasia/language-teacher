<?php

namespace Tests\Unit\Models;

use App\Models\Error;
use App\Models\TextSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_many_text_submissions(): void
    {
        $user = User::factory()->create();
        TextSubmission::factory()->count(3)->create(['user_id' => $user->id]);

        $this->assertCount(3, $user->textSubmissions);
    }

    public function test_user_has_many_errors_through_submissions(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        Error::factory()->count(2)->create(['text_submission_id' => $submission->id]);

        $this->assertCount(2, $user->errors);
    }
}
