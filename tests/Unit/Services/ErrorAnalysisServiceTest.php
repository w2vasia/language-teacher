<?php

namespace Tests\Unit\Services;

use App\Models\ErrorCategory;
use App\Models\TextSubmission;
use App\Models\User;
use App\Services\ErrorAnalysisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorAnalysisServiceTest extends TestCase
{
    use RefreshDatabase;

    private ErrorAnalysisService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\ErrorCategorySeeder::class);
        $this->service = new ErrorAnalysisService();
    }

    public function test_map_category_typos_to_spelling(): void
    {
        $this->assertEquals('spelling', $this->service->mapCategory('TYPOS'));
    }

    public function test_map_category_grammar(): void
    {
        $this->assertEquals('grammar', $this->service->mapCategory('GRAMMAR'));
    }

    public function test_map_category_casing_to_capitalization(): void
    {
        $this->assertEquals('capitalization', $this->service->mapCategory('CASING'));
    }

    public function test_map_category_unknown_to_other(): void
    {
        $this->assertEquals('other', $this->service->mapCategory('UNKNOWN_CATEGORY'));
    }

    public function test_store_errors_creates_records(): void
    {
        $submission = TextSubmission::factory()->create();
        $matches = [
            [
                'message' => 'Possible spelling mistake',
                'context' => ['text' => 'Ths is wrong', 'offset' => 0, 'length' => 3],
                'offset' => 0,
                'length' => 3,
                'replacements' => [['value' => 'This'], ['value' => 'The']],
                'rule' => [
                    'id' => 'MORFOLOGIK_RULE',
                    'description' => 'Spelling rule',
                    'category' => ['id' => 'TYPOS'],
                ],
            ],
        ];

        $errors = $this->service->storeErrors($submission, $matches);

        $this->assertCount(1, $errors);
        $this->assertDatabaseHas('errors', [
            'text_submission_id' => $submission->id,
            'message' => 'Possible spelling mistake',
        ]);
    }

    public function test_get_error_summary_returns_slug_counts(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);

        $grammar = ErrorCategory::where('slug', 'grammar')->first();
        $spelling = ErrorCategory::where('slug', 'spelling')->first();

        \App\Models\Error::factory()->count(3)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $grammar->id,
        ]);
        \App\Models\Error::factory()->count(2)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $spelling->id,
        ]);

        $summary = $this->service->getErrorSummary($user);

        $this->assertEquals(3, $summary['grammar']);
        $this->assertEquals(2, $summary['spelling']);
    }
}
