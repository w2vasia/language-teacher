<?php

namespace Tests\Feature;

use App\Models\Error;
use App\Models\ErrorCategory;
use App\Models\PracticeSession;
use App\Models\TextSubmission;
use App\Models\User;
use Database\Seeders\ErrorCategorySeeder;
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
            ->where('source', 'text-check')
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

    public function test_practice_source_shows_sessions_with_errors(): void
    {
        $this->seed(ErrorCategorySeeder::class);

        $user = User::factory()->create();
        $category = ErrorCategory::where('slug', 'grammar')->first();

        $session = PracticeSession::factory()->create([
            'user_id' => $user->id,
            'error_category_id' => $category->id,
        ]);

        Error::factory()->count(2)->create([
            'user_id' => $user->id,
            'text_submission_id' => null,
            'practice_session_id' => $session->id,
            'error_category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)->get('/error-history?source=practice');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('ErrorHistory')
            ->where('source', 'practice')
            ->has('practiceSessions.data', 1)
            ->has('practiceSessions.data.0.errors', 2)
            ->where('submissions', null)
        );
    }

    public function test_practice_source_hides_sessions_without_errors_by_default(): void
    {
        $this->seed(ErrorCategorySeeder::class);

        $user = User::factory()->create();
        $category = ErrorCategory::where('slug', 'grammar')->first();

        // Session with errors
        $withErrors = PracticeSession::factory()->create([
            'user_id' => $user->id,
            'error_category_id' => $category->id,
        ]);
        Error::factory()->create([
            'user_id' => $user->id,
            'text_submission_id' => null,
            'practice_session_id' => $withErrors->id,
            'error_category_id' => $category->id,
        ]);

        // Session without errors (perfect score)
        PracticeSession::factory()->create([
            'user_id' => $user->id,
            'error_category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)->get('/error-history?source=practice');

        $response->assertInertia(fn ($page) => $page
            ->has('practiceSessions.data', 1)
        );
    }

    public function test_practice_show_all_includes_perfect_sessions(): void
    {
        $this->seed(ErrorCategorySeeder::class);

        $user = User::factory()->create();
        $category = ErrorCategory::where('slug', 'grammar')->first();

        // Session with errors
        $withErrors = PracticeSession::factory()->create([
            'user_id' => $user->id,
            'error_category_id' => $category->id,
        ]);
        Error::factory()->create([
            'user_id' => $user->id,
            'text_submission_id' => null,
            'practice_session_id' => $withErrors->id,
            'error_category_id' => $category->id,
        ]);

        // Perfect session
        PracticeSession::factory()->create([
            'user_id' => $user->id,
            'error_category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)->get('/error-history?source=practice&show_all=1');

        $response->assertInertia(fn ($page) => $page
            ->has('practiceSessions.data', 2)
            ->where('showAll', true)
        );
    }
}
