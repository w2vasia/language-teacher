<?php

namespace App\Services;

use App\Models\Error;
use App\Models\User;
use Illuminate\Support\Carbon;

class GrammarTopicService
{
    /** @var array<string, list<string>> */
    private const TOPIC_MAP = [
        'Articles' => ['EN_A_VS_AN', 'A_UNCOUNTABLE', 'MISSING_ARTICLE_', 'THE_', 'DT_'],
        'Verb Tenses' => ['VERB_FORM', 'PAST_TENSE', 'PROGRESSIVE_VERBS', 'GOING_TO_VB'],
        'Subject-Verb Agreement' => ['AGREEMENT_', 'HE_VERB_AGR', 'PERS_PRONOUN_AGREEMENT'],
        'Prepositions' => ['PREPOSITION_', 'IN_ON_AT', 'PREP_'],
        'Word Order' => ['WORD_ORDER_', 'ADV_POSITION'],
        'Conjunctions' => ['CONJ_', 'COMMA_BEFORE_AND'],
        'Pronouns' => ['PRONOUN_', 'PRP_', 'POSSESSIVE_'],
        'Plural/Singular' => ['PLURAL_', 'SINGULAR_', 'COUNTABLE_'],
        'Spelling' => ['MORFOLOGIK_RULE', 'HUNSPELL_'],
        'Punctuation' => ['COMMA_', 'PERIOD_', 'PUNCTUATION_'],
        'Capitalization' => ['UPPERCASE_', 'SENTENCE_START_', 'CAPS_'],
    ];

    /** @var array<string, string> */
    private const TOPIC_TIPS = [
        'Articles' => 'Review when to use the/a/an before nouns. Pay attention to countable vs uncountable.',
        'Verb Tenses' => 'Practice matching verb forms to time expressions (yesterday = past, now = present).',
        'Subject-Verb Agreement' => 'Check that singular subjects pair with singular verbs (he goes, they go).',
        'Prepositions' => 'Pay attention to fixed preposition + noun combinations (at home, on time, in the morning).',
        'Word Order' => 'English follows Subject-Verb-Object order. Adverbs usually go before the main verb.',
        'Conjunctions' => 'Review how to join clauses with and, but, because, although.',
        'Pronouns' => 'Make sure pronouns agree with their antecedent in number and gender.',
        'Plural/Singular' => 'Watch for irregular plurals and uncountable nouns that don\'t take -s.',
        'Spelling' => 'Double-check commonly confused words (their/there, its/it\'s).',
        'Punctuation' => 'Review comma rules: before conjunctions in compound sentences, after introductory phrases.',
        'Capitalization' => 'Capitalize sentence beginnings, proper nouns, and titles.',
        'Other' => 'Review these miscellaneous rules to improve your writing.',
    ];

    /**
     * @return list<array{
     *     topic: string,
     *     error_count: int,
     *     trend: string,
     *     change: int,
     *     examples: list<array{context: string, message: string, suggestion: string}>,
     *     tip: string,
     *     rules: list<string>,
     * }>
     */
    public function getTopicsToReview(User $user, ?int $days = null): array
    {
        $currentCounts = $this->getRuleCounts($user, $days, 'current');
        $previousCounts = $days !== null
            ? $this->getRuleCounts($user, $days, 'previous')
            : [];

        $topics = $this->aggregateByTopic($currentCounts);
        $previousTopics = $this->aggregateByTopic($previousCounts);

        $result = [];

        foreach ($topics as $topicName => $data) {
            $currentCount = $data['count'];
            $previousCount = $previousTopics[$topicName]['count'] ?? 0;

            $result[] = [
                'topic' => $topicName,
                'error_count' => $currentCount,
                'trend' => $this->calculateTrend($currentCount, $previousCount, $days),
                'change' => abs($currentCount - $previousCount),
                'examples' => $this->getExamples($user, $data['rule_ids'], $days),
                'tip' => self::TOPIC_TIPS[$topicName] ?? self::TOPIC_TIPS['Other'],
                'rules' => $data['rule_ids'],
            ];
        }

        usort($result, fn (array $a, array $b) => $b['error_count'] <=> $a['error_count']);

        return $result;
    }

    public function resolveTopicForRule(string $ruleId): string
    {
        foreach (self::TOPIC_MAP as $topic => $patterns) {
            foreach ($patterns as $pattern) {
                if ($pattern === $ruleId || str_starts_with($ruleId, $pattern)) {
                    return $topic;
                }
            }
        }

        return 'Other';
    }

    /**
     * @return array<string, int>
     */
    private function getRuleCounts(User $user, ?int $days, string $period): array
    {
        $query = Error::where('user_id', $user->id);

        if ($days !== null) {
            $currentStart = Carbon::today()->subDays($days - 1);

            if ($period === 'current') {
                $query->where('errors.created_at', '>=', $currentStart);
            } else {
                $previousStart = $currentStart->copy()->subDays($days);
                $query->where('errors.created_at', '>=', $previousStart)
                    ->where('errors.created_at', '<', $currentStart);
            }
        }

        return $query
            ->selectRaw('rule_id, count(*) as count')
            ->groupBy('rule_id')
            ->pluck('count', 'rule_id')
            ->toArray();
    }

    /**
     * @param  array<string, int>  $ruleCounts
     * @return array<string, array{count: int, rule_ids: list<string>}>
     */
    private function aggregateByTopic(array $ruleCounts): array
    {
        $topics = [];

        foreach ($ruleCounts as $ruleId => $count) {
            $topic = $this->resolveTopicForRule($ruleId);

            if (! isset($topics[$topic])) {
                $topics[$topic] = ['count' => 0, 'rule_ids' => []];
            }

            $topics[$topic]['count'] += $count;

            if (! in_array($ruleId, $topics[$topic]['rule_ids'], true)) {
                $topics[$topic]['rule_ids'][] = $ruleId;
            }
        }

        return $topics;
    }

    private function calculateTrend(int $current, int $previous, ?int $days): string
    {
        if ($days === null) {
            return 'stable';
        }

        if ($previous === 0 && $current > 0) {
            return 'new';
        }

        if ($current < $previous) {
            return 'better';
        }

        if ($current > $previous) {
            return 'worse';
        }

        return 'stable';
    }

    /**
     * @param  list<string>  $ruleIds
     * @return list<array{context: string, message: string, suggestion: string}>
     */
    private function getExamples(User $user, array $ruleIds, ?int $days): array
    {
        $query = Error::where('user_id', $user->id)
            ->whereIn('rule_id', $ruleIds);

        if ($days !== null) {
            $query->where('errors.created_at', '>=', Carbon::today()->subDays($days - 1));
        }

        return $query
            ->latest('errors.created_at')
            ->limit(3)
            ->get()
            ->map(fn (Error $error) => [
                'context' => $error->context ?? '',
                'message' => $error->message ?? '',
                'suggestion' => $error->replacement_suggestions[0] ?? '',
            ])
            ->values()
            ->toArray();
    }
}
