<?php

namespace App\Services;

use App\Models\Error;
use App\Models\ErrorCategory;
use App\Models\TextSubmission;
use App\Models\User;

class ErrorAnalysisService
{
    private const CATEGORY_MAP = [
        'TYPOS' => 'spelling',
        'GRAMMAR' => 'grammar',
        'CASING' => 'capitalization',
        'STYLE' => 'style',
        'TYPOGRAPHY' => 'typography',
        'PUNCTUATION' => 'punctuation',
    ];

    public function mapCategory(string $ltCategory): string
    {
        return self::CATEGORY_MAP[$ltCategory] ?? 'other';
    }

    public function storeErrors(TextSubmission $submission, array $matches): array
    {
        $errors = [];
        $categoryCache = [];

        foreach ($matches as $match) {
            $ltCategory = $match['rule']['category']['id'] ?? 'OTHER';
            $slug = $this->mapCategory($ltCategory);
            $category = $categoryCache[$slug] ??= ErrorCategory::where('slug', $slug)->first()
                ?? ErrorCategory::where('slug', 'other')->firstOrFail();

            $errors[] = Error::create([
                'user_id' => $submission->user_id,
                'text_submission_id' => $submission->id,
                'error_category_id' => $category->id,
                'message' => $match['message'] ?? '',
                'context' => $match['context']['text'] ?? null,
                'offset' => $match['offset'] ?? 0,
                'length' => $match['length'] ?? 0,
                'replacement_suggestions' => array_map(
                    fn ($r) => $r['value'],
                    $match['replacements'] ?? []
                ),
                'rule_id' => $match['rule']['id'] ?? null,
                'rule_description' => $match['rule']['description'] ?? null,
            ]);
        }

        return $errors;
    }

    public function getErrorSummary(User $user): array
    {
        return $user->errors()
            ->join('error_categories', 'errors.error_category_id', '=', 'error_categories.id')
            ->selectRaw('error_categories.slug, count(*) as count')
            ->groupBy('error_categories.slug')
            ->pluck('count', 'slug')
            ->toArray();
    }
}
