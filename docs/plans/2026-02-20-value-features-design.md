# Value Features Design — MVP Slice

## Differentiator

"Grammarly fixes your text. We teach you to stop making the mistakes."

Target: non-native English speakers — students, exam prepares (IELTS/TOEFL), business professionals.
Key advantages: learning focus, exam prep, privacy (self-hosted LanguageTool).

## Build Order

Phase 1 → Enhanced Analytics → Phase 2 → Writing Prompts → Phase 3 → Spaced Repetition → Phase 4 → Streaks/Gamification

---

## Phase 1: Enhanced Analytics

No new models. Extends existing `ProgressTrackerService`.

### MVP Scope

- Time range selector on analytics page: 7d / 30d / 90d / all time
- Period-over-period comparison arrows on stat cards (e.g. "grammar errors -32% vs previous period")
- Error-rate-per-100-words trend chart (more meaningful than raw count)

### Iteration

- Per-category sparklines
- Auto-generated text insights ("Your biggest improvement: spelling -45%")
- Exercise stats (after Phase 3)

---

## Phase 2: Writing Prompts

### New Models

- `WritingPrompt` — `title`, `body`, `category` (enum: general/ielts/toefl/business), `difficulty` (enum: beginner/intermediate/advanced)
- `TextSubmission` gets nullable `writing_prompt_id` FK

### MVP Scope

- ~20 seed prompts across categories
- Prompt browser page with category filters
- Submit flows through existing analyze endpoint
- Simple score: `max(0, 100 - (errors / word_count * 500))`
- Category breakdown showing where points were lost
- Approximate band/scale label for exam prompts

### Iteration

- Timed mode
- Prompt history showing past attempts + improvement
- AI-generated feedback
- User-submitted prompts

---

## Phase 3: Spaced Repetition Exercises

### New Models

- `Exercise` — belongs to `Error`
  - `next_review_at` (datetime)
  - `interval_days` (int)
  - `ease_factor` (float, default 2.5)
  - `times_reviewed` (int)
  - `times_correct` (int)

### MVP Scope

- Auto-generate exercises from saved errors on "Analyze & Save"
- Exercise type: "Pick the fix" only (multiple choice — correct replacement + distractors from other suggestions)
- Practice page showing daily review queue (~10 exercises, sorted by `next_review_at`)
- Simplified SM-2 scheduling:
  - Correct: interval × ease_factor (1→3→7→14→30 days)
  - Wrong: reset interval to 1 day, ease_factor -= 0.2 (min 1.3)
- Category badge on each exercise

### Iteration

- "Spot the error" exercise type (highlight the mistake)
- "Type the correction" exercise type (free-text, fuzzy match)
- Mastery indicators per category
- Exercise generation from writing prompt submissions

---

## Phase 4: Streaks & Gamification

### New Models

- `UserStreak` — `user_id`, `current_streak`, `longest_streak`, `last_active_date`, `weekly_goal`
- `Achievement` — seeded milestone definitions (7d, 30d, 60d, 100d)
- `UserAchievement` — pivot: `user_id`, `achievement_id`, `earned_at`

### MVP Scope

- Streak tracking via `StreakService` (synchronous, no queue)
  - Qualifying actions: text check, exercise completion, writing prompt submission
  - Same day → no-op, yesterday → increment, older → reset to 1
- Streak counter in nav bar (flame icon + number)
- Dashboard streak widget
- Milestone toast notifications on achievement

### Iteration

- Weekly goal ring (3/5/7 days target)
- Activity heatmap (GitHub-style, 3 months)
- More achievement types (word count milestones, category mastery, etc.)

---

## Summary

| Phase | New Models | New Pages | Modified |
|-------|-----------|-----------|----------|
| 1. Analytics | — | — | Analytics, Dashboard |
| 2. Prompts | WritingPrompt | Writing Prompts | TextCheck, TextSubmission model |
| 3. Exercises | Exercise | Practice | Analyze flow |
| 4. Streaks | UserStreak, Achievement, UserAchievement | — | Dashboard, nav bar |

Total new models: 5. Total new pages: 2. Monetization paywall placement to be decided after features ship.
