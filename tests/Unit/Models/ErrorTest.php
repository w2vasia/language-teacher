<?php

namespace Tests\Unit\Models;

use App\Models\Error;
use App\Models\ErrorCategory;
use App\Models\TextSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorTest extends TestCase
{
    use RefreshDatabase;

    public function test_belongs_to_text_submission(): void
    {
        $error = Error::factory()->create();

        $this->assertInstanceOf(TextSubmission::class, $error->textSubmission);
    }

    public function test_belongs_to_error_category(): void
    {
        $error = Error::factory()->create();

        $this->assertInstanceOf(ErrorCategory::class, $error->errorCategory);
    }

    public function test_replacement_suggestions_cast_to_array(): void
    {
        $error = Error::factory()->create([
            'replacement_suggestions' => ['fix1', 'fix2'],
        ]);

        $this->assertIsArray($error->fresh()->replacement_suggestions);
        $this->assertEquals(['fix1', 'fix2'], $error->fresh()->replacement_suggestions);
    }
}
