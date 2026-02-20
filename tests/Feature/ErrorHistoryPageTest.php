<?php

namespace Tests\Feature;

use App\Models\Error;
use App\Models\TextSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorHistoryPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_error_history_requires_auth(): void
    {
        $this->get('/error-history')->assertRedirect('/login');
    }

    public function test_error_history_renders_with_submissions(): void
    {
        $user = User::factory()->create();
        $sub = TextSubmission::factory()->create(['user_id' => $user->id]);
        Error::factory()->count(2)->create(['text_submission_id' => $sub->id]);

        $response = $this->actingAs($user)->get('/error-history');

        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('ErrorHistory')
            ->has('submissions.data', 1)
        );
    }
}
