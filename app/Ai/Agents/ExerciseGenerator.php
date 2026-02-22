<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

#[Temperature(0.7)]
class ExerciseGenerator implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'INST'
        You are an English language exercise generator for learners at B1–B2 level.
        Given an error category (e.g. grammar, spelling, punctuation), generate a mix of exercise types:
        - fix_the_sentence: provide a sentence with an error; student must rewrite it correctly.
        - multiple_choice: provide a sentence and 3 options; one is correct.
        - fill_in_the_blank: provide a sentence with ___ blank; student fills in the correct word/phrase.
        Make exercises varied, natural, and focused on the given category.
        INST;
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'exercises' => $schema->array()->items(
                $schema->object([
                    'type' => $schema->string()->enum(['fix_the_sentence', 'multiple_choice', 'fill_in_the_blank'])->required(),
                    'instruction' => $schema->string()->required(),
                    'sentence' => $schema->string(),
                    'options' => $schema->array()->items($schema->string()),
                    'correct_answer' => $schema->string(),
                    'correct_index' => $schema->integer(),
                ])
            )->required(),
        ];
    }
}
