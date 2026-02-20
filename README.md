# Language Teacher

Writing improvement app — submit text, get errors detected via LanguageTool, track mistakes over time, see progress on a dashboard.

## Tech Stack

- **Backend**: Laravel 12, PHP 8.5
- **Frontend**: React 18, Inertia.js v2, Tailwind CSS v3, Vite
- **Database**: PostgreSQL 18
- **Cache/Sessions**: Redis
- **Error Detection**: [LanguageTool](https://dev.languagetool.org/http-server) (self-hosted Docker container)
- **Infrastructure**: Docker Compose via Laravel Sail
- **Auth**: Laravel Breeze + Sanctum
- **Testing**: PHPUnit 11

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Setup

```bash
git clone <repo-url> && cd language-teacher
cp .env.example .env

# install deps & start containers
composer install
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan db:seed
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

App runs at `http://localhost`.

### Commands

```bash
vendor/bin/sail up -d                    # start
vendor/bin/sail stop                     # stop
vendor/bin/sail artisan test --compact   # tests
vendor/bin/sail bin pint --dirty         # lint PHP
vendor/bin/sail npm run build            # production build
```

## Architecture

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Overview stats |
| `/text-check` | TextCheck | Submit text for error checking |
| `/error-history` | ErrorHistory | Browse past errors |
| `/analytics` | Analytics | Progress charts & weak areas |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/check-text` | Quick grammar check (no persist) |
| `POST` | `/api/v1/text/analyze` | Check + store errors |
| `GET` | `/api/v1/text/errors` | Error history |
| `GET` | `/api/v1/analytics/dashboard` | Dashboard stats |
| `GET` | `/api/v1/analytics/weak-areas` | Weak area analysis |

### Services

- **LanguageToolService** — HTTP client to LanguageTool API
- **ErrorAnalysisService** — maps LanguageTool categories → internal categories, stores errors
- **ProgressTrackerService** — dashboard stats, trends, weak areas

### Models

```
User → TextSubmission → Error → ErrorCategory
```

7 seeded error categories: grammar, spelling, typography, style, capitalization, punctuation, other.

### Dual Controller Pattern

- `app/Http/Controllers/` — Inertia page controllers (`Inertia::render()`)
- `app/Http/Controllers/Api/V1/` — JSON API controllers

TextCheck page uses both: Inertia renders the page, React calls the API via axios.

## Docker Services

| Service | Image | Port |
|---------|-------|------|
| laravel.test | sail-8.5/app | 80 |
| pgsql | postgres:18-alpine | 5432 |
| redis | redis:alpine | 6379 |
| languagetool | erikvl87/languagetool | 8010 |

## License

MIT
