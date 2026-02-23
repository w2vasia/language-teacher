# Translation Feature Design

## Summary

Add text translation to the TextCheck page. User's input text gets translated alongside error checking. Side-by-side layout: textarea left, translation right, errors below.

## Translation Service

Driver-based pattern (like Laravel mail/cache):

- **Contract:** `TranslationDriver` interface — `translate(string $text, string $from, string $to): string`
- **Drivers:** `LibreTranslateDriver` (local Docker), `DeepLDriver` (production, stubbed for now)
- **Config:** `config/translation.php` — driver name, target language (`ru`), per-driver settings
- **Docker:** LibreTranslate container in `docker-compose.yml`

## Database

- Migration: add `translated_text` (nullable text) to `text_submissions`

## API Changes

- `POST /api/v1/check-text` — response adds `translation` string field
- `POST /api/v1/text/analyze` — response adds `translation` field, persists `translated_text` to DB
- `TextSubmissionResource` — exposes `translated_text`

## Frontend

```
┌─────────────────────────────────────────────┐
│  [Quick Check]  [Analyze & Save]            │
├──────────────────────┬──────────────────────┤
│                      │                      │
│   Textarea input     │   Translation        │
│   (user types here)  │   (read-only panel)  │
│                      │                      │
├──────────────────────┴──────────────────────┤
│                                             │
│   MatchList (errors) — full width below     │
│                                             │
└─────────────────────────────────────────────┘
```

- Translation panel empty before check, shows result after
- Both panels equal height, translation scrolls if needed
- Read-only styled block with subtle background

## Target Language

Hardcoded `ru` in config. Later: per-user setting.

## Implementation Order

- [x] LibreTranslate Docker service
- [x] `config/translation.php`
- [x] `TranslationDriver` interface + `LibreTranslateDriver` + `DeepLDriver` (stub)
- [x] `TranslationService` (resolves driver from config) + service provider registration
- [x] Migration: `translated_text` on `text_submissions`
- [x] API controllers: call TranslationService in both endpoints
- [x] `TextSubmissionResource`: expose `translated_text`
- [x] Frontend: two-column layout + translation display
- [x] Tests: feature + unit
