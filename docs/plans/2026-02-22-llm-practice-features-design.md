# LLM-Powered Error Explanations & Practice Exercises

## Problem

The app diagnoses writing errors but doesn't teach. Users see *what's wrong* but not *why* or *how to improve*. There's no active learning — the experience is passive (submit text, read results).

## Solution

Two new features powered by the Laravel AI SDK (`laravel/ai`):

1. **Error Explanations** — LLM-generated plain-language explanations with correct/incorrect examples, inline on every error match
2. **Practice Page** — targeted exercises (fix-the-sentence, multiple-choice, fill-in-the-blank) generated from the user's weakest error categories

## LLM Provider Strategy

Laravel AI SDK abstracts the provider. Configured per environment:

- **Local dev**: Ollama (`Lab::Ollama`) — free, no API key needed
- **Production**: Anthropic Claude (`Lab::Anthropic`) — higher quality

Config via `.env`:
```
AI_PROVIDER=ollama          # or anthropic
AI_MODEL=llama3.2           # or claude-haiku-4-5-20251001
ANTHROPIC_API_KEY=           # prod only
```

---

## Feature 1: Error Explanations

### UX Flow

1. User checks text (TextCheck page or Writing Prompts)
2. Each error match in MatchList shows an "Explain" button
3. On click → API call → inline expansion with:
   - Plain-language explanation of the rule
   - Incorrect example (with highlight)
   - Correct example (with highlight)
4. Collapsible — user can dismiss

### Backend

**Agent**: `ErrorExplainer` (structured output)

```
php artisan make:agent ErrorExplainer --structured
```

Instructions: "You are a language teacher. Explain this writing error to an English learner. Be concise (2-3 sentences). Provide one incorrect and one correct example sentence demonstrating the rule."

Structured schema:
```json
{
  "explanation": "string",
  "incorrect_example": "string",
  "correct_example": "string"
}
```

**Endpoint**: `POST /api/v1/errors/explain`

Request body:
```json
{
  "message": "Possible spelling mistake found.",
  "context": "I went to the libary yesterday.",
  "category": "spelling",
  "rule_id": "MORFOLOGIK_RULE_EN_US",
  "replacement": "library"
}
```

Response:
```json
{
  "explanation": "\"Libary\" is a misspelling of \"library.\" The word has two r's — remember: lib-ra-ry.",
  "incorrect_example": "I borrowed a book from the libary.",
  "correct_example": "I borrowed a book from the library."
}
```

**Controller**: `Api/V1/ErrorExplainController@store`
**Form Request**: `ExplainErrorRequest` — validates message, context, category required; rule_id and replacement optional.

No persistence — explanations are ephemeral, generated on demand.

### Frontend

- Add "Explain" button to each error item in `MatchList.tsx`
- Loading state: pulsing skeleton placeholder
- Display: card with explanation text + two example blocks (red/green styled)
- State: local per-error, no global state needed

---

## Feature 2: Practice Page

### UX Flow

1. User navigates to `/practice` from nav
2. Page shows top 3 weak categories as selectable chips (pre-selected: weakest)
3. Can pick any category manually
4. Hits "Start Practice" → generates batch of 5 exercises
5. Each exercise shown one at a time, card-based:
   - **Fix the sentence**: shows flawed sentence, user types corrected version
   - **Multiple choice**: "Which is correct?" with 3 options (radio buttons)
   - **Fill in the blank**: sentence with `___`, user types answer
6. User submits answer → LLM evaluates → shows correct/incorrect + explanation
7. "Next" advances to next exercise
8. After all 5: summary card (e.g., "4/5 correct") + "Practice Again" button

### Backend

**Agent 1**: `ExerciseGenerator` (structured output)

```
php artisan make:agent ExerciseGenerator --structured
```

Instructions: "You are a language teacher. Generate English writing exercises targeting the given error category. Mix the following formats randomly: fix_the_sentence, multiple_choice, fill_in_the_blank. Each exercise must be clearly solvable with one correct answer. Target intermediate English learners."

Structured schema:
```json
[
  {
    "type": "fix_the_sentence",
    "instruction": "Fix the error in this sentence:",
    "sentence": "She don't like coffee.",
    "correct_answer": "She doesn't like coffee."
  },
  {
    "type": "multiple_choice",
    "instruction": "Which sentence is correct?",
    "options": ["He go to school.", "He goes to school.", "He going to school."],
    "correct_index": 1
  },
  {
    "type": "fill_in_the_blank",
    "instruction": "Fill in the blank:",
    "sentence": "They ___ to the store yesterday.",
    "correct_answer": "went"
  }
]
```

**Agent 2**: `ExerciseChecker` (structured output)

```
php artisan make:agent ExerciseChecker --structured
```

Instructions: "You are a language teacher. Evaluate whether the student's answer is correct for the given exercise. Be lenient with minor differences (extra spaces, capitalization) but strict on the actual language rule being tested. Provide a brief explanation."

Structured schema:
```json
{
  "correct": true,
  "explanation": "string"
}
```

**Endpoints**:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/practice/exercises` | Generate exercise batch |
| `POST` | `/api/v1/practice/check` | Evaluate a single answer |

`GET /api/v1/practice/exercises?category=grammar&count=5`

Response: array of exercise objects (schema above)

`POST /api/v1/practice/check`

Request:
```json
{
  "exercise": { "type": "fix_the_sentence", "sentence": "...", "correct_answer": "..." },
  "user_answer": "She doesn't like coffee."
}
```

Response:
```json
{
  "correct": true,
  "explanation": "Correct! \"Doesn't\" is the right third-person singular negative form."
}
```

**Controllers**:
- `Api/V1/PracticeController@exercises` (GET)
- `Api/V1/PracticeController@check` (POST)

**Form Requests**:
- `GenerateExercisesRequest` — validates category (must be valid slug), count (integer, 1-10, default 5)
- `CheckExerciseRequest` — validates exercise object and user_answer required

**Inertia Controller**:
- `PracticeController@index` — renders Practice page with weak areas from `ProgressTrackerService`

### Frontend

New page: `resources/js/Pages/Practice.tsx`

Props from server:
```typescript
{
  weakCategories: Array<{ slug: string; name: string; count: number }>
}
```

Component state machine:
```
IDLE → LOADING → PRACTICING → CHECKING → RESULT → (next exercise or SUMMARY)
```

- Category selector: chips with error counts
- Exercise card: renders differently per `type`
- Answer input: textarea (fix), radio group (MC), text input (blank)
- Result: green/red banner with explanation
- Summary: score display + "Practice Again" CTA

No persistence for exercises — stateless, fresh each session.

---

## New Files Summary

### Backend
```
app/Ai/Agents/ErrorExplainer.php
app/Ai/Agents/ExerciseGenerator.php
app/Ai/Agents/ExerciseChecker.php
app/Http/Controllers/Api/V1/ErrorExplainController.php
app/Http/Controllers/Api/V1/PracticeController.php     (API)
app/Http/Controllers/PracticeController.php             (Inertia)
app/Http/Requests/ExplainErrorRequest.php
app/Http/Requests/GenerateExercisesRequest.php
app/Http/Requests/CheckExerciseRequest.php
```

### Frontend
```
resources/js/Pages/Practice.tsx
```

### Modified Files
```
resources/js/Components/MatchList.tsx          (add Explain button)
routes/api.php                                  (new endpoints)
routes/web.php                                  (practice route)
resources/js/Layouts/AuthenticatedLayout.tsx    (nav link)
```

---

## Implementation Order

1. Install `laravel/ai`, publish config, configure providers
2. ErrorExplainer agent + endpoint + form request + tests
3. Explain button in MatchList frontend
4. ExerciseGenerator + ExerciseChecker agents + endpoints + form requests + tests
5. Practice Inertia controller + page + frontend
6. Nav link + integration testing

---

## Out of Scope (future)

- Caching explanations per rule_id
- Persisting exercise results / tracking practice progress over time
- Spaced repetition of past errors
- Difficulty scaling based on user level
