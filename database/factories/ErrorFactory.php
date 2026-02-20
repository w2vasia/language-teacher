<?php

namespace Database\Factories;

use App\Models\ErrorCategory;
use App\Models\TextSubmission;
use Illuminate\Database\Eloquent\Factories\Factory;

class ErrorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'text_submission_id' => TextSubmission::factory(),
            'error_category_id' => ErrorCategory::factory(),
            'message' => fake()->sentence(),
            'context' => fake()->sentence(),
            'offset' => fake()->numberBetween(0, 100),
            'length' => fake()->numberBetween(1, 20),
            'replacement_suggestions' => [fake()->word()],
            'rule_id' => 'RULE_' . fake()->numberBetween(1, 100),
            'rule_description' => fake()->sentence(),
        ];
    }
}
