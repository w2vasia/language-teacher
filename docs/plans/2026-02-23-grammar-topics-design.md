# Grammar Topics to Review — Design

## Summary

Replace the broad "Weak Areas" section on Analytics page with granular grammar topic recommendations. Groups LanguageTool rule_ids into meaningful topics (Articles, Verb Tenses, Prepositions, etc.), shows error counts with period trend, example errors from user history, and actionable practice tips.

## Data Approach

No new DB tables. Leverages existing `errors.rule_id` and `errors.rule_description` columns.

### Static Rule → Topic Mapping

`GrammarTopicService` defines a constant mapping of LanguageTool rule_id patterns to grammar topics:

```php
const TOPIC_MAP = [
    'Articles'              => ['EN_A_VS_AN', 'A_UNCOUNTABLE', 'MISSING_ARTICLE_*', 'THE_*', 'DT_*'],
    'Verb Tenses'           => ['VERB_FORM*', 'PAST_TENSE*', 'PROGRESSIVE_VERBS', 'GOING_TO_VB'],
    'Subject-Verb Agreement'=> ['AGREEMENT_*', 'HE_VERB_AGR', 'PERS_PRONOUN_AGREEMENT'],
    'Prepositions'          => ['PREPOSITION_*', 'IN_ON_AT*', 'PREP_*'],
    'Word Order'            => ['WORD_ORDER_*', 'ADV_POSITION*'],
    'Conjunctions'          => ['CONJ_*', 'COMMA_BEFORE_AND'],
    'Pronouns'              => ['PRONOUN_*', 'PRP_*', 'POSSESSIVE_*'],
    'Plural/Singular'       => ['PLURAL_*', 'SINGULAR_*', 'COUNTABLE_*'],
    'Spelling'              => ['MORFOLOGIK_RULE*', 'HUNSPELL_*'],
    'Punctuation'           => ['COMMA_*', 'PERIOD_*', 'PUNCTUATION_*'],
    'Capitalization'        => ['UPPERCASE_*', 'SENTENCE_START_*', 'CAPS_*'],
];
```

Pattern matching: `*` suffix = startsWith match, exact otherwise. Unmapped rules fall into "Other" topic.

Each topic also has a static practice tip:

```php
const TOPIC_TIPS = [
    'Articles'               => 'Review when to use the/a/an before nouns. Pay attention to countable vs uncountable.',
    'Verb Tenses'            => 'Practice matching verb forms to time expressions (yesterday→past, now→present).',
    'Subject-Verb Agreement' => 'Check that singular subjects pair with singular verbs (he goes, they go).',
    // ...
];
```

## Backend

### New: `GrammarTopicService`

Location: `app/Services/GrammarTopicService.php`

```php
public function getTopicsToReview(User $user, ?int $days = null): array
```

Steps:
1. Query `errors` for this user (filtered by date range if `$days` set), grouped by `rule_id` — get counts
2. Map each `rule_id` to a topic via TOPIC_MAP pattern matching
3. Aggregate counts per topic
4. For previous period comparison: repeat query for previous period, compute trend (`better`/`worse`/`stable`/`new`)
5. For each topic, fetch up to 3 example errors (most recent, with `context`, `message`, `replacement_suggestions`)
6. Return array sorted by `error_count` DESC

Return shape:
```php
[
    [
        'topic'       => 'Articles (a/the)',
        'error_count' => 23,
        'trend'       => 'worse',       // 'better' | 'worse' | 'stable' | 'new'
        'change'      => 5,             // absolute difference from previous period
        'examples'    => [
            [
                'context'    => 'I went to park yesterday',
                'message'    => 'Consider adding an article',
                'suggestion' => 'the park',
            ],
        ],
        'tip'   => 'Review when to use the/a/an before nouns.',
        'rules' => ['EN_A_VS_AN', 'MISSING_ARTICLE'],
    ],
]
```

Trend logic:
- `new`: no errors in previous period, has errors now
- `better`: current count < previous count
- `worse`: current count > previous count
- `stable`: equal counts

### Modified: `AnalyticsPageController`

- Inject `GrammarTopicService`
- Replace `ProgressTrackerService::getWeakAreas()` with `GrammarTopicService::getTopicsToReview($user, $days)`
- Pass as `topicsToReview` prop (replaces `weakAreas`)

### Modified: `DashboardController`

- Keep `weakAreas` on dashboard (it's a quick overview, broad categories are fine there)
- No changes needed

## Frontend

### Modified: `Analytics.tsx`

Remove `weakAreas` prop, add `topicsToReview` prop:

```typescript
interface GrammarTopic {
    topic: string;
    error_count: number;
    trend: 'better' | 'worse' | 'stable' | 'new';
    change: number;
    examples: { context: string; message: string; suggestion: string }[];
    tip: string;
    rules: string[];
}
```

Replace "Weak Areas" section with "Grammar Topics to Review" — card list where each card:
- **Header row:** topic name + error count badge + trend indicator (↑ red / ↓ green / → gray)
- **Expandable body** (click to toggle): 2-3 example errors with context (mistake highlighted), message, suggestion
- **Footer:** practice tip in muted text

Cards sorted by error_count DESC. Show all topics that have errors (no limit).

## Testing

### Unit: `GrammarTopicService`
- Rule pattern matching (exact, wildcard, unmapped → Other)
- Topic aggregation from multiple rules
- Trend calculation (better/worse/stable/new)
- Example selection (most recent, max 3)
- Date filtering (with days param, without)

### Feature: `AnalyticsPageController`
- Topics returned in response props
- Date range filtering works
- Empty state (no errors → empty array)

## Migration Path

- `weakAreas` prop removed from Analytics page
- Dashboard still uses `weakAreas` (unchanged)
- No DB migration needed
