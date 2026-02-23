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
        You are an English language exercise generator for learners.
        Given an error category (e.g. grammar, spelling, punctuation) and difficulty level, generate a mix of exercise types:
        - fix_the_sentence: provide a sentence with an error; student must rewrite it correctly.
        - multiple_choice: provide a sentence and 3 options; one is correct.
        - fill_in_the_blank: provide a sentence with ___ blank; student fills in the correct word/phrase.
        - translate_to_english: provide a Russian sentence; student must translate it to English. Include the expected English translation as correct_answer.

        Difficulty guidelines:
        - beginner: short sentences, present/past simple tenses, common everyday vocabulary.
        - intermediate: compound sentences, varied tenses, some idiomatic expressions.
        - advanced: subordinate clauses, passive voice, conditionals, nuanced vocabulary.

        For a set of 5 exercises, include 1-2 translate_to_english exercises mixed in with the other types.
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
                    'type' => $schema->string()->enum(['fix_the_sentence', 'multiple_choice', 'fill_in_the_blank', 'translate_to_english'])->required(),
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
