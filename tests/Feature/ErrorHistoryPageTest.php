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
        $response->assertInertia(fn ($page) => $page
            ->component('ErrorHistory')
            ->has('submissions.data', 1)
        );
    }

    public function test_hides_submissions_without_errors_by_default(): void
    {
        $user = User::factory()->create();
        $withErrors = TextSubmission::factory()->create(['user_id' => $user->id]);
        Error::factory()->create(['text_submission_id' => $withErrors->id]);
        TextSubmission::factory()->create(['user_id' => $user->id]); // no errors

        $response = $this->actingAs($user)->get('/error-history');

        $response->assertInertia(fn ($page) => $page
            ->has('submissions.data', 1)
            ->where('showAll', false)
        );
    }

    public function test_show_all_includes_submissions_without_errors(): void
    {
        $user = User::factory()->create();
        $withErrors = TextSubmission::factory()->create(['user_id' => $user->id]);
        Error::factory()->create(['text_submission_id' => $withErrors->id]);
        TextSubmission::factory()->create(['user_id' => $user->id]); // no errors

        $response = $this->actingAs($user)->get('/error-history?show_all=1');

        $response->assertInertia(fn ($page) => $page
            ->has('submissions.data', 2)
            ->where('showAll', true)
        );
    }
}
