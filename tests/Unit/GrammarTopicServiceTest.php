<?php

namespace Tests\Unit;

use App\Models\Error;
use App\Models\ErrorCategory;
use App\Models\TextSubmission;
use App\Models\User;
use App\Services\GrammarTopicService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GrammarTopicServiceTest extends TestCase
{
    use RefreshDatabase;

    private GrammarTopicService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\ErrorCategorySeeder::class);
        $this->service = new GrammarTopicService;
    }

    public function test_exact_rule_maps_to_topic(): void
    {
        $this->assertSame('Articles', $this->service->resolveTopicForRule('EN_A_VS_AN'));
        $this->assertSame('Verb Tenses', $this->service->resolveTopicForRule('PROGRESSIVE_VERBS'));
        $this->assertSame('Conjunctions', $this->service->resolveTopicForRule('COMMA_BEFORE_AND'));
    }

    public function test_prefix_rule_maps_to_topic(): void
    {
        $this->assertSame('Articles', $this->service->resolveTopicForRule('MISSING_ARTICLE_BEFORE_NOUN'));
        $this->assertSame('Spelling', $this->service->resolveTopicForRule('MORFOLOGIK_RULE_EN_US'));
        $this->assertSame('Prepositions', $this->service->resolveTopicForRule('PREPOSITION_OF'));
    }

    public function test_unmapped_rule_falls_to_other(): void
    {
        $this->assertSame('Other', $this->service->resolveTopicForRule('SOME_UNKNOWN_RULE'));
    }

    public function test_aggregates_multiple_rules_into_topic(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
        ]);
        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'MISSING_ARTICLE_BEFORE_NOUN',
        ]);

        $topics = $this->service->getTopicsToReview($user);

        $articlesTopic = collect($topics)->firstWhere('topic', 'Articles');
        $this->assertNotNull($articlesTopic);
        $this->assertSame(2, $articlesTopic['error_count']);
        $this->assertContains('EN_A_VS_AN', $articlesTopic['rules']);
        $this->assertContains('MISSING_ARTICLE_BEFORE_NOUN', $articlesTopic['rules']);
    }

    public function test_trend_worse_when_current_exceeds_previous(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        // Previous period: 1 error (8-14 days ago)
        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'created_at' => now()->subDays(10),
        ]);

        // Current period: 3 errors (last 7 days)
        Error::factory()->count(3)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'created_at' => now()->subDays(2),
        ]);

        $topics = $this->service->getTopicsToReview($user, 7);

        $articlesTopic = collect($topics)->firstWhere('topic', 'Articles');
        $this->assertSame('worse', $articlesTopic['trend']);
        $this->assertSame(2, $articlesTopic['change']);
    }

    public function test_trend_better_when_current_less_than_previous(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        // Previous period: 3 errors
        Error::factory()->count(3)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'created_at' => now()->subDays(10),
        ]);

        // Current period: 1 error
        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'created_at' => now()->subDays(2),
        ]);

        $topics = $this->service->getTopicsToReview($user, 7);

        $articlesTopic = collect($topics)->firstWhere('topic', 'Articles');
        $this->assertSame('better', $articlesTopic['trend']);
    }

    public function test_trend_new_when_no_previous_errors(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        // Only current period errors
        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'created_at' => now()->subDays(2),
        ]);

        $topics = $this->service->getTopicsToReview($user, 7);

        $articlesTopic = collect($topics)->firstWhere('topic', 'Articles');
        $this->assertSame('new', $articlesTopic['trend']);
    }

    public function test_trend_stable_when_all_time(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
        ]);

        $topics = $this->service->getTopicsToReview($user, null);

        $articlesTopic = collect($topics)->firstWhere('topic', 'Articles');
        $this->assertSame('stable', $articlesTopic['trend']);
    }

    public function test_examples_limited_to_three(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->count(5)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'context' => 'I went to park',
            'message' => 'Missing article',
            'replacement_suggestions' => ['the park'],
        ]);

        $topics = $this->service->getTopicsToReview($user);

        $articlesTopic = collect($topics)->firstWhere('topic', 'Articles');
        $this->assertCount(3, $articlesTopic['examples']);
    }

    public function test_examples_contain_expected_fields(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'context' => 'I went to park',
            'message' => 'Missing article',
            'replacement_suggestions' => ['the park'],
        ]);

        $topics = $this->service->getTopicsToReview($user);
        $example = collect($topics)->firstWhere('topic', 'Articles')['examples'][0];

        $this->assertSame('I went to park', $example['context']);
        $this->assertSame('Missing article', $example['message']);
        $this->assertSame('the park', $example['suggestion']);
    }

    public function test_date_filtering_excludes_old_errors(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        // Old error outside 7-day window
        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'created_at' => now()->subDays(30),
        ]);

        $topics = $this->service->getTopicsToReview($user, 7);

        $this->assertEmpty($topics);
    }

    public function test_no_date_filter_includes_all_errors(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
            'created_at' => now()->subDays(100),
        ]);

        $topics = $this->service->getTopicsToReview($user, null);

        $this->assertNotEmpty($topics);
    }

    public function test_sorted_by_error_count_desc(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->count(1)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
        ]);
        Error::factory()->count(5)->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'MORFOLOGIK_RULE_EN_US',
        ]);

        $topics = $this->service->getTopicsToReview($user);

        $this->assertSame('Spelling', $topics[0]['topic']);
        $this->assertSame('Articles', $topics[1]['topic']);
    }

    public function test_empty_when_user_has_no_errors(): void
    {
        $user = User::factory()->create();

        $topics = $this->service->getTopicsToReview($user);

        $this->assertSame([], $topics);
    }

    public function test_tip_present_for_each_topic(): void
    {
        $user = User::factory()->create();
        $submission = TextSubmission::factory()->create(['user_id' => $user->id]);
        $category = ErrorCategory::first();

        Error::factory()->create([
            'text_submission_id' => $submission->id,
            'error_category_id' => $category->id,
            'rule_id' => 'EN_A_VS_AN',
        ]);

        $topics = $this->service->getTopicsToReview($user);

        $this->assertNotEmpty($topics[0]['tip']);
        $this->assertStringContainsString('the/a/an', $topics[0]['tip']);
    }
}
