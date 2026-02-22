# Writing Prompts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a writing prompts feature — users browse curated prompts by category, write a response, submit through the existing analyze flow, and see a score based on error rate.

**Architecture:** New `WritingPrompt` model + seeder. Add nullable `writing_prompt_id` FK to `text_submissions`. New Inertia page for browsing/writing. Extend existing analyze API to accept optional `writing_prompt_id`. Score computed client-side from error/word data. No new services needed.

**Tech Stack:** Laravel 12, Inertia v2, React 18, Tailwind v3, PHPUnit

---

### Task 1: WritingPrompt model, migration, factory, seeder

**Files:**
- Create: `app/Models/WritingPrompt.php` (via artisan)
- Create: `database/migrations/xxxx_create_writing_prompts_table.php`
- Create: `database/factories/WritingPromptFactory.php`
- Create: `database/seeders/WritingPromptSeeder.php`
- Test: `tests/Feature/Models/WritingPromptTest.php`

**Step 1: Generate model with migration + factory + seeder**

Run: `vendor/bin/sail artisan make:model WritingPrompt -mfs --no-interaction`

**Step 2: Write the migration**

In the generated migration file:

```php
Schema::create('writing_prompts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->string('category'); // general, ielts, toefl, business
    $table->string('difficulty'); // beginner, intermediate, advanced
    $table->timestamps();
});
```

**Step 3: Write the model**

`app/Models/WritingPrompt.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WritingPrompt extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'body', 'category', 'difficulty'];

    public function textSubmissions(): HasMany
    {
        return $this->hasMany(TextSubmission::class);
    }
}
```

**Step 4: Write the factory**

`database/factories/WritingPromptFactory.php`:

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WritingPromptFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(6),
            'body' => fake()->paragraph(3),
            'category' => fake()->randomElement(['general', 'ielts', 'toefl', 'business']),
            'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
        ];
    }
}
```

**Step 5: Write the seeder with ~20 prompts**

`database/seeders/WritingPromptSeeder.php` — use `firstOrCreate` on `title` so it's idempotent. Include prompts across all 4 categories and 3 difficulties. Example prompts:

- General/beginner: "Describe your daily routine"
- General/intermediate: "Write about a memorable travel experience"
- IELTS/intermediate: "Some people believe that technology has made our lives more complicated. To what extent do you agree or disagree?"
- IELTS/advanced: "In many countries, the gap between the rich and the poor is widening. Discuss the causes and suggest solutions."
- TOEFL/intermediate: "Do you agree or disagree: It is better to have a broad knowledge of many subjects than to specialize in one."
- Business/beginner: "Write an email to a colleague requesting a meeting to discuss a new project."
- Business/advanced: "Draft a response to a client complaint about a delayed shipment."

Include 5 general, 5 ielts, 5 toefl, 5 business prompts.

**Step 6: Write test**

`tests/Feature/Models/WritingPromptTest.php`:

```php
<?php

namespace Tests\Feature\Models;

use App\Models\TextSubmission;
use App\Models\User;
use App\Models\WritingPrompt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WritingPromptTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_writing_prompt(): void
    {
        $prompt = WritingPrompt::factory()->create();

        $this->assertDatabaseHas('writing_prompts', ['id' => $prompt->id]);
    }

    public function test_has_many_text_submissions(): void
    {
        $prompt = WritingPrompt::factory()->create();
        $user = User::factory()->create();
        $sub = TextSubmission::factory()->create([
            'user_id' => $user->id,
            'writing_prompt_id' => $prompt->id,
        ]);

        $this->assertTrue($prompt->textSubmissions->contains($sub));
    }

    public function test_seeder_creates_prompts(): void
    {
        $this->seed(\Database\Seeders\WritingPromptSeeder::class);

        $this->assertDatabaseCount('writing_prompts', 20);
        $this->assertEquals(4, WritingPrompt::distinct('category')->count('category'));
    }
}
```

Note: the `writing_prompt_id` test will fail until Task 2 adds the FK. Run the `can_create` and `seeder` tests first, then the relationship test after Task 2.

**Step 7: Run migration + seeder test**

Run: `vendor/bin/sail artisan migrate`
Run: `vendor/bin/sail artisan test --compact --filter=test_can_create_writing_prompt`
Run: `vendor/bin/sail artisan test --compact --filter=test_seeder_creates_prompts`
Expected: PASS

**Step 8: Commit**

```
feat: add WritingPrompt model, migration, factory, seeder (20 prompts)
```

---

### Task 2: Add writing_prompt_id FK to text_submissions

**Files:**
- Create: `database/migrations/xxxx_add_writing_prompt_id_to_text_submissions_table.php`
- Modify: `app/Models/TextSubmission.php` — add `writing_prompt_id` to fillable, add `writingPrompt()` relation
- Modify: `database/factories/TextSubmissionFactory.php` — add nullable `writing_prompt_id`
- Test: `tests/Feature/Models/WritingPromptTest.php` (the relationship test from Task 1)

**Step 1: Generate migration**

Run: `vendor/bin/sail artisan make:migration add_writing_prompt_id_to_text_submissions_table --table=text_submissions --no-interaction`

**Step 2: Write migration**

```php
public function up(): void
{
    Schema::table('text_submissions', function (Blueprint $table) {
        $table->foreignId('writing_prompt_id')->nullable()->constrained()->nullOnDelete();
    });
}

public function down(): void
{
    Schema::table('text_submissions', function (Blueprint $table) {
        $table->dropConstrainedForeignId('writing_prompt_id');
    });
}
```

**Step 3: Update TextSubmission model**

Add `'writing_prompt_id'` to `$fillable`. Add relationship:

```php
public function writingPrompt(): BelongsTo
{
    return $this->belongsTo(WritingPrompt::class);
}
```

**Step 4: Run migration + relationship test**

Run: `vendor/bin/sail artisan migrate`
Run: `vendor/bin/sail artisan test --compact tests/Feature/Models/WritingPromptTest.php`
Expected: ALL 3 PASS

**Step 5: Commit**

```
feat: add writing_prompt_id FK to text_submissions
```

---

### Task 3: Update analyze API to accept writing_prompt_id

**Files:**
- Modify: `app/Http/Requests/CheckTextRequest.php` — add optional `writing_prompt_id` rule
- Modify: `app/Http/Controllers/Api/V1/TextAnalysisController.php` — pass `writing_prompt_id` to create
- Modify: `app/Http/Resources/TextSubmissionResource.php` — include `writing_prompt_id` + `score`
- Test: `tests/Feature/Api/V1/TextAnalysisTest.php`

**Step 1: Write failing tests**

Add to `tests/Feature/Api/V1/TextAnalysisTest.php` (find existing file — it likely has analyze tests already):

```php
public function test_analyze_accepts_writing_prompt_id(): void
{
    $user = User::factory()->create();
    $prompt = WritingPrompt::factory()->create();

    Http::fake(['*' => Http::response(['matches' => []])]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/text/analyze', [
            'text' => 'This is a test sentence for the prompt.',
            'writing_prompt_id' => $prompt->id,
        ]);

    $response->assertCreated();
    $this->assertDatabaseHas('text_submissions', [
        'user_id' => $user->id,
        'writing_prompt_id' => $prompt->id,
    ]);
}

public function test_analyze_works_without_writing_prompt_id(): void
{
    $user = User::factory()->create();

    Http::fake(['*' => Http::response(['matches' => []])]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/text/analyze', [
            'text' => 'Just a regular text check.',
        ]);

    $response->assertCreated();
    $this->assertDatabaseHas('text_submissions', [
        'user_id' => $user->id,
        'writing_prompt_id' => null,
    ]);
}

public function test_analyze_rejects_invalid_writing_prompt_id(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/text/analyze', [
            'text' => 'Some text here.',
            'writing_prompt_id' => 99999,
        ]);

    $response->assertUnprocessable();
}
```

**Step 2: Run tests to verify they fail**

Run: `vendor/bin/sail artisan test --compact --filter=test_analyze_accepts_writing_prompt_id`
Expected: FAIL

**Step 3: Update CheckTextRequest**

Add to rules array:

```php
'writing_prompt_id' => 'sometimes|nullable|exists:writing_prompts,id',
```

**Step 4: Update TextAnalysisController::analyze**

Change the `TextSubmission::create` call:

```php
$submission = TextSubmission::create([
    'user_id' => $request->user()->id,
    'original_text' => $request->validated('text'),
    'writing_prompt_id' => $request->validated('writing_prompt_id'),
    'checked_at' => now(),
]);
```

**Step 5: Update TextSubmissionResource**

Add to the return array:

```php
'writing_prompt_id' => $this->writing_prompt_id,
'score' => $this->when($this->relationLoaded('errors'), function () {
    $wordCount = $this->word_count;
    if ($wordCount === 0) {
        return 0;
    }
    $errorCount = $this->errors->count();
    return max(0, round(100 - ($errorCount / $wordCount * 500)));
}),
```

**Step 6: Run tests**

Run: `vendor/bin/sail artisan test --compact --filter=test_analyze_accepts_writing_prompt`
Run: `vendor/bin/sail artisan test --compact --filter=test_analyze_works_without`
Run: `vendor/bin/sail artisan test --compact --filter=test_analyze_rejects_invalid`
Expected: ALL PASS

Also run existing analyze tests to check for regressions:
Run: `vendor/bin/sail artisan test --compact tests/Feature/Api/V1/TextAnalysisTest.php`

**Step 7: Commit**

```
feat: analyze API accepts writing_prompt_id, resource includes score
```

---

### Task 4: Writing Prompts API endpoint + web controller

**Files:**
- Create: `app/Http/Controllers/Api/V1/WritingPromptController.php`
- Create: `app/Http/Controllers/WritingPromptsPageController.php`
- Create: `app/Http/Resources/WritingPromptResource.php`
- Modify: `routes/api.php` — add prompt listing route
- Modify: `routes/web.php` — add writing-prompts route
- Test: `tests/Feature/WritingPromptsPageTest.php`
- Test: `tests/Feature/Api/V1/WritingPromptTest.php`

**Step 1: Create resource**

`app/Http/Resources/WritingPromptResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WritingPromptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'category' => $this->category,
            'difficulty' => $this->difficulty,
        ];
    }
}
```

**Step 2: Create API controller**

`app/Http/Controllers/Api/V1/WritingPromptController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WritingPromptResource;
use App\Models\WritingPrompt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WritingPromptController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = WritingPrompt::query();

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($difficulty = $request->query('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        return WritingPromptResource::collection($query->orderBy('category')->orderBy('difficulty')->get());
    }
}
```

**Step 3: Create web controller**

`app/Http/Controllers/WritingPromptsPageController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\WritingPrompt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WritingPromptsPageController extends Controller
{
    public function index(): Response
    {
        $prompts = WritingPrompt::query()
            ->orderBy('category')
            ->orderBy('difficulty')
            ->get()
            ->groupBy('category');

        return Inertia::render('WritingPrompts/Index', [
            'promptsByCategory' => $prompts,
        ]);
    }

    public function show(WritingPrompt $writingPrompt): Response
    {
        return Inertia::render('WritingPrompts/Show', [
            'prompt' => $writingPrompt,
        ]);
    }
}
```

**Step 4: Add routes**

In `routes/web.php`, inside the `auth` middleware group:

```php
Route::get('/writing-prompts', [\App\Http\Controllers\WritingPromptsPageController::class, 'index'])->name('writing-prompts.index');
Route::get('/writing-prompts/{writingPrompt}', [\App\Http\Controllers\WritingPromptsPageController::class, 'show'])->name('writing-prompts.show');
```

In `routes/api.php`, inside the v1 group:

```php
Route::get('/writing-prompts', [WritingPromptController::class, 'index']);
```

Add the import: `use App\Http\Controllers\Api\V1\WritingPromptController;`

**Step 5: Write tests**

`tests/Feature/WritingPromptsPageTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WritingPrompt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WritingPromptsPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_requires_auth(): void
    {
        $this->get('/writing-prompts')->assertRedirect('/login');
    }

    public function test_index_renders_with_prompts(): void
    {
        $user = User::factory()->create();
        WritingPrompt::factory()->count(3)->create();

        $response = $this->actingAs($user)->get('/writing-prompts');

        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('WritingPrompts/Index')
            ->has('promptsByCategory')
        );
    }

    public function test_show_renders_prompt(): void
    {
        $user = User::factory()->create();
        $prompt = WritingPrompt::factory()->create();

        $response = $this->actingAs($user)->get("/writing-prompts/{$prompt->id}");

        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('WritingPrompts/Show')
            ->has('prompt')
            ->where('prompt.id', $prompt->id)
        );
    }
}
```

`tests/Feature/Api/V1/WritingPromptTest.php`:

```php
<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\WritingPrompt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WritingPromptTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_prompts(): void
    {
        $user = User::factory()->create();
        WritingPrompt::factory()->count(5)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/writing-prompts');

        $response->assertOk();
        $this->assertCount(5, $response->json('data'));
    }

    public function test_index_filters_by_category(): void
    {
        $user = User::factory()->create();
        WritingPrompt::factory()->create(['category' => 'ielts']);
        WritingPrompt::factory()->create(['category' => 'general']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/writing-prompts?category=ielts');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('ielts', $response->json('data.0.category'));
    }

    public function test_index_requires_auth(): void
    {
        $this->getJson('/api/v1/writing-prompts')->assertUnauthorized();
    }
}
```

**Step 6: Run tests**

Run: `vendor/bin/sail artisan test --compact tests/Feature/WritingPromptsPageTest.php`
Run: `vendor/bin/sail artisan test --compact tests/Feature/Api/V1/WritingPromptTest.php`
Expected: ALL PASS

**Step 7: Commit**

```
feat: writing prompts API + web controllers, routes, tests
```

---

### Task 5: Writing Prompts Index page (React)

**Files:**
- Create: `resources/js/Pages/WritingPrompts/Index.tsx`
- Modify: `resources/js/Layouts/AuthenticatedLayout.tsx` — add nav link

**Step 1: Add nav link**

In `resources/js/Layouts/AuthenticatedLayout.tsx`, add a "Prompts" NavLink between "Text Check" and "Error History" in both the desktop nav and responsive nav sections:

Desktop:
```tsx
<NavLink
    href={route('writing-prompts.index')}
    active={route().current('writing-prompts.*')}
>
    Prompts
</NavLink>
```

Responsive (find the ResponsiveNavLink section):
```tsx
<ResponsiveNavLink
    href={route('writing-prompts.index')}
    active={route().current('writing-prompts.*')}
>
    Prompts
</ResponsiveNavLink>
```

**Step 2: Create Index page**

`resources/js/Pages/WritingPrompts/Index.tsx`:

Displays prompts grouped by category. Each category is a section with a heading. Each prompt is a card showing title, difficulty badge, and a truncated body preview. Clicking a prompt navigates to the Show page via `<Link>`.

Key components:
- Category tabs or sections (General, IELTS, TOEFL, Business)
- Difficulty badge colors: beginner=emerald, intermediate=amber, advanced=rose
- Card layout: title, difficulty badge, body preview (2 lines truncated)
- Link to `/writing-prompts/{id}`

Use the app's existing design system: `bg-white/60 backdrop-blur-sm`, `border-amber-200/40`, `font-serif` for headings, `text-amber-950` colors.

**Step 3: Build and verify**

Run: `vendor/bin/sail npm run build`
Expected: BUILD SUCCESS

Run: `vendor/bin/sail artisan test --compact tests/Feature/WritingPromptsPageTest.php`
Expected: ALL PASS

**Step 4: Commit**

```
feat: writing prompts index page + nav link
```

---

### Task 6: Writing Prompt Show page (write + submit + score)

**Files:**
- Create: `resources/js/Pages/WritingPrompts/Show.tsx`

**Step 1: Create Show page**

This is the core writing experience. Layout:

**Top section:** Prompt card showing title, category badge, difficulty badge, full body text.

**Writing section:** Textarea for user's response. Two buttons:
- "Submit & Score" — calls `POST /api/v1/text/analyze` with `{ text, writing_prompt_id: prompt.id }`
- "Quick Check" — calls `POST /api/v1/check-text` with `{ text }` (no save)

**Results section** (shown after submit):
- **Score banner:** Large score number (0-100), color-coded (green >=70, amber 40-69, rose <40)
- For IELTS/TOEFL prompts: approximate band label based on score ranges
  - IELTS: 0-19="~Band 4", 20-39="~Band 5", 40-59="~Band 6", 60-79="~Band 7", 80-100="~Band 8+"
  - TOEFL: 0-19="~15/30", 20-39="~20/30", 40-59="~22/30", 60-79="~25/30", 80-100="~28/30"
- **Category breakdown:** Which error categories contributed to point deductions
- **Error list:** Same match list rendering as TextCheck page

Score formula (client-side): `Math.max(0, Math.round(100 - (errorCount / wordCount * 500)))`

Word count (client-side estimate for display): `text.trim().split(/\s+/).filter(Boolean).length`

The actual score from the API response (`submission.score`) should be used when available (after Analyze & Save), with the client-side estimate as a preview during Quick Check.

**Step 2: Build and verify**

Run: `vendor/bin/sail npm run build`
Expected: BUILD SUCCESS

**Step 3: Commit**

```
feat: writing prompt show page — write, submit, score display
```

---

### Task 7: Run Pint + full test suite

**Step 1: Run Pint**

Run: `vendor/bin/sail bin pint --dirty --format agent`

**Step 2: Run full test suite**

Run: `vendor/bin/sail artisan test --compact`
Expected: ALL PASS

**Step 3: Commit any Pint fixes**

```
style: pint formatting
```
