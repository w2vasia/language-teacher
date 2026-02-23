# Translation Exercises Design

## Summary

Add `translate_to_english` as a 4th exercise type in the Practice page. AI generates Russian sentences targeting the user's weak grammar areas at a chosen difficulty level. User translates to English, AI evaluates accuracy. Also adds a difficulty selector (beginner/intermediate/advanced) to all exercise types.

## Exercise Object

```json
{
  "type": "translate_to_english",
  "instruction": "Translate this sentence to English",
  "sentence": "Вчера я ходил в парк с друзьями.",
  "correct_answer": "Yesterday I went to the park with my friends."
}
```

No `options` or `correct_index` fields — free-text answer only.

## Backend

### Modified: `ExerciseGenerator` AI Agent

Update system prompt to:
- Accept `difficulty` parameter (beginner/intermediate/advanced)
- Include `translate_to_english` in available exercise types
- For translation exercises: generate Russian sentences at the target difficulty, provide expected English `correct_answer`
- Difficulty controls complexity for all exercise types (bonus)
- Mix ~1-2 translation exercises per 5-exercise session

Difficulty guidelines in prompt:
- **Beginner**: short sentences, present/past simple, common vocabulary
- **Intermediate**: compound sentences, varied tenses, some idioms
- **Advanced**: subordinate clauses, passive voice, conditionals, nuanced vocabulary

### Modified: `ExerciseChecker` AI Agent

Update system prompt to:
- Recognize `translate_to_english` type
- Evaluate semantic accuracy (does English capture the Russian meaning?)
- Be lenient on phrasing variations (multiple valid translations)
- Provide specific feedback: what was good, what was missed/awkward

### Modified: `GenerateExercisesRequest`

Add optional difficulty validation:
```php
'difficulty' => 'sometimes|string|in:beginner,intermediate,advanced',
```

### Modified: `CheckExerciseRequest`

Add `translate_to_english` to allowed exercise types in the `type` validation rule.

### Modified: `Api/V1/PracticeController`

Pass `difficulty` from request to `ExerciseGenerator`.

### API

```
GET /api/v1/practice/exercises?category=grammar&count=5&difficulty=intermediate
```

`difficulty` is optional — defaults to intermediate if not provided.

## Frontend

### Modified: `Practice.tsx`

**Difficulty selector** — `TabSelector` component below category picker:
- Options: Beginner | Intermediate | Advanced (default: Intermediate)
- Value sent with exercises API request

**Translation exercise renderer** (in `practicing` stage):
- When `type === 'translate_to_english'`:
  - Russian sentence in a distinct card (larger text, subtle background differentiation)
  - Textarea for English translation (multi-line, unlike single-line input for other types)
  - "Check" button

**Result display** (in `result` stage):
- Same green/red feedback pattern as other exercises
- Shows reference translation (`correct_answer`) after checking so user can compare

FSM stages unchanged. Only the render logic branches on exercise type.

## Testing

### Feature: `Api/V1/PracticeController`
- Exercises endpoint accepts difficulty param
- Exercises endpoint works without difficulty (backward compatible)
- Check endpoint accepts `translate_to_english` type
- Invalid difficulty rejected

### Unit: Validation
- `GenerateExercisesRequest` validates difficulty values
- `CheckExerciseRequest` accepts new exercise type

## Files Changed

- `app/Ai/Agents/ExerciseGenerator.php` — prompt + difficulty param
- `app/Ai/Agents/ExerciseChecker.php` — prompt for translation evaluation
- `app/Http/Requests/GenerateExercisesRequest.php` — difficulty rule
- `app/Http/Requests/CheckExerciseRequest.php` — new type in validation
- `app/Http/Controllers/Api/V1/PracticeController.php` — pass difficulty
- `resources/js/Pages/Practice.tsx` — difficulty selector + translation renderer
- `tests/Feature/Api/V1/PracticeControllerTest.php` — new test cases
