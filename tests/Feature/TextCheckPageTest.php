<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TextCheckPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_text_check_requires_auth(): void
    {
        $this->get('/text-check')->assertRedirect('/login');
    }

    public function test_text_check_renders(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/text-check');

        $response->assertOk();
        $response->assertInertia(fn($page) => $page->component('TextCheck'));
    }
}
