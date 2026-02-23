<?php

namespace Database\Factories;

use App\Models\ErrorCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PracticeSession>
 */
class PracticeSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'error_category_id' => ErrorCategory::factory(),
            'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'total_exercises' => 5,
        ];
    }
}
