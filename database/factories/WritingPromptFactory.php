<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WritingPrompt>
 */
class WritingPromptFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(6),
            'body' => fake()->paragraph(3),
            'category' => fake()->randomElement(['general', 'ielts', 'toefl', 'business']),
            'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
        ];
    }
}
