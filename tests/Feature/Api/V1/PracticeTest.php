<?php

namespace Tests\Feature\Api\V1;

use App\Ai\Agents\ExerciseChecker;
use App\Ai\Agents\ExerciseGenerator;
use App\Models\User;
use Database\Seeders\ErrorCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PracticeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ErrorCategorySeeder::class);
    }

    public function test_exercises_unauthenticated_returns_401(): void
    {
        $response = $this->getJson('/api/v1/practice/exercises?category=grammar');

        $response->assertUnauthorized();
    }

    public function test_check_unauthenticated_returns_401(): void
    {
        $response = $this->postJson('/api/v1/practice/check', [
            'exercise' => ['type' => 'fix_the_sentence', 'instruction' => 'Fix it'],
            'user_answer' => 'test',
        ]);

        $response->assertUnauthorized();
    }

    public function test_generates_exercises(): void
    {
        ExerciseGenerator::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/practice/exercises?category=grammar');

        $response->assertOk()
            ->assertJsonStructure(['exercises']);

        ExerciseGenerator::assertPrompted(fn ($prompt) => $prompt->contains('grammar'));
    }

    public function test_validates_category_required(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/practice/exercises');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('category');
    }

    public function test_validates_category_exists(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/practice/exercises?category=nonexistent');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('category');
    }

    public function test_validates_exercise_type_enum(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/practice/check', [
                'exercise' => ['type' => 'invalid_type', 'instruction' => 'Fix it'],
                'user_answer' => 'test',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('exercise.type');
    }

    public function test_checks_answer(): void
    {
        ExerciseChecker::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/practice/check', [
                'exercise' => [
                    'type' => 'fix_the_sentence',
                    'instruction' => 'Fix the grammar error in this sentence.',
                    'sentence' => 'She go to school every day.',
                    'correct_answer' => 'She goes to school every day.',
                ],
                'user_answer' => 'She goes to school every day.',
            ]);

        $response->assertOk()
            ->assertJsonStructure(['correct', 'explanation']);
    }

    public function test_validates_user_answer_required(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/practice/check', [
                'exercise' => [
                    'type' => 'fix_the_sentence',
                    'instruction' => 'Fix it',
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('user_answer');
    }
}
