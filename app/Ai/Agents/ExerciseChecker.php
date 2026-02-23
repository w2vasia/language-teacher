<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

#[Temperature(0.2)]
class ExerciseChecker implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'INST'
        You are an English language exercise evaluator.
        Given an exercise (type, instruction, sentence, correct answer) and the student's answer,
        determine if the student's answer is correct.
        Be lenient on minor differences (capitalization, trailing punctuation, extra spaces)
        but strict on the grammatical/spelling rule being tested.

        For translate_to_english exercises: the sentence is in Russian and the student translates to English.
        Evaluate semantic accuracy — does the English capture the Russian meaning?
        Be lenient on phrasing variations since multiple valid translations exist.
        Provide specific feedback: what was captured well, what was missed or awkward.

        Provide a brief explanation of why the answer is correct or incorrect.
        INST;
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'correct' => $schema->boolean()->required(),
            'explanation' => $schema->string()->required(),
        ];
    }
}
