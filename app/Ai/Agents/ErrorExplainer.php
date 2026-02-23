<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

#[Temperature(0.3)]
class ErrorExplainer implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'INST'
        You are a concise language teacher helping English learners understand their writing errors.
        Given an error message, context, and category, provide:
        1. A brief, clear explanation of why it is wrong and the grammar/spelling/style rule behind it.
        2. An incorrect example sentence demonstrating the mistake.
        3. A correct example sentence showing proper usage.
        Keep explanations at B1–B2 level. Be direct, no filler.
        INST;
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'explanation' => $schema->string()->required(),
            'incorrect_example' => $schema->string()->required(),
            'correct_example' => $schema->string()->required(),
        ];
    }
}
