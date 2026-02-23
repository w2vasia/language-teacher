<?php

namespace Tests\Feature;

use App\Models\Error;
use App\Models\TextSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PracticePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_practice_requires_auth(): void
    {
        $this->get('/practice')->assertRedirect('/login');
    }

    public function test_practice_renders_with_weak_categories(): void
    {
        $user = User::factory()->create();
        $sub = TextSubmission::factory()->create(['user_id' => $user->id]);
        Error::factory()->count(3)->create(['text_submission_id' => $sub->id]);

        $response = $this->actingAs($user)->get('/practice');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Practice')
            ->has('weakCategories')
        );
    }

    public function test_practice_renders_empty_weak_categories(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/practice');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Practice')
            ->where('weakCategories', [])
        );
    }
}
