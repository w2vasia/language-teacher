<?php

namespace Tests\Feature\Api\V1;

use App\Ai\Agents\ExerciseChecker;
use App\Ai\Agents\ExerciseGenerator;
use App\Models\Error;
use App\Models\PracticeSession;
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
            ->assertJsonStructure(['exercises', 'session_id']);

        ExerciseGenerator::assertPrompted(fn ($prompt) => $prompt->contains('grammar'));
    }

    public function test_exercises_creates_practice_session(): void
    {
        ExerciseGenerator::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/practice/exercises?category=grammar&count=5&difficulty=advanced');

        $response->assertOk();

        $this->assertDatabaseHas('practice_sessions', [
            'user_id' => $user->id,
            'difficulty' => 'advanced',
            'total_exercises' => 5,
        ]);

        $session = PracticeSession::where('user_id', $user->id)->first();
        $this->assertEquals($response->json('session_id'), $session->id);
    }

    public function test_generates_exercises_with_difficulty(): void
    {
        ExerciseGenerator::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/practice/exercises?category=grammar&difficulty=advanced');

        $response->assertOk()
            ->assertJsonStructure(['exercises', 'session_id']);

        ExerciseGenerator::assertPrompted(fn ($prompt) => $prompt->contains('advanced'));
    }

    public function test_generates_exercises_without_difficulty_defaults_to_intermediate(): void
    {
        ExerciseGenerator::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/practice/exercises?category=grammar');

        $response->assertOk();

        ExerciseGenerator::assertPrompted(fn ($prompt) => $prompt->contains('intermediate'));
    }

    public function test_rejects_invalid_difficulty(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/practice/exercises?category=grammar&difficulty=expert');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('difficulty');
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

    public function test_checks_translate_to_english_exercise(): void
    {
        ExerciseChecker::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/practice/check', [
                'exercise' => [
                    'type' => 'translate_to_english',
                    'instruction' => 'Translate this sentence to English',
                    'sentence' => 'Вчера я ходил в парк с друзьями.',
                    'correct_answer' => 'Yesterday I went to the park with my friends.',
                ],
                'user_answer' => 'Yesterday I went to the park with friends.',
            ]);

        $response->assertOk()
            ->assertJsonStructure(['correct', 'explanation']);
    }

    public function test_wrong_answer_with_category_creates_error(): void
    {
        ExerciseChecker::fake([
            ['correct' => false, 'explanation' => 'The correct form is "goes".'],
        ]);

        $user = User::factory()->create();
        $session = PracticeSession::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/practice/check', [
                'exercise' => [
                    'type' => 'fix_the_sentence',
                    'instruction' => 'Fix the grammar error.',
                    'sentence' => 'She go to school.',
                    'correct_answer' => 'She goes to school.',
                ],
                'user_answer' => 'She go to school.',
                'category' => 'grammar',
                'session_id' => $session->id,
            ]);

        $response->assertOk()
            ->assertJson(['correct' => false]);

        $this->assertDatabaseHas('errors', [
            'user_id' => $user->id,
            'text_submission_id' => null,
            'practice_session_id' => $session->id,
            'message' => 'The correct form is "goes".',
            'context' => 'She go to school.',
        ]);

        $error = Error::where('user_id', $user->id)->first();
        $this->assertSame(['She goes to school.'], $error->replacement_suggestions);
    }

    public function test_correct_answer_does_not_create_error(): void
    {
        ExerciseChecker::fake([
            ['correct' => true, 'explanation' => 'Well done!'],
        ]);

        $user = User::factory()->create();
        $session = PracticeSession::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/practice/check', [
                'exercise' => [
                    'type' => 'fix_the_sentence',
                    'instruction' => 'Fix it.',
                    'sentence' => 'She go to school.',
                    'correct_answer' => 'She goes to school.',
                ],
                'user_answer' => 'She goes to school.',
                'category' => 'grammar',
                'session_id' => $session->id,
            ]);

        $this->assertDatabaseMissing('errors', ['user_id' => $user->id]);
    }

    public function test_wrong_answer_without_category_does_not_create_error(): void
    {
        ExerciseChecker::fake([
            ['correct' => false, 'explanation' => 'Wrong.'],
        ]);

        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/practice/check', [
                'exercise' => [
                    'type' => 'fix_the_sentence',
                    'instruction' => 'Fix it.',
                    'sentence' => 'She go to school.',
                ],
                'user_answer' => 'She go to school.',
            ]);

        $this->assertDatabaseMissing('errors', ['user_id' => $user->id]);
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
