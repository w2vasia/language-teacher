# Language Learning Application

## What It Does

A self-hosted web application that helps users improve their writing skills by automatically detecting errors, tracking mistakes over time, and generating personalized practice exercises.

## Core Features

### 1. Error Detection & Analysis

- Integrates with LanguageTool API to check grammar, spelling, and style
- Highlights errors in real-time with explanations and suggestions
- Stores all errors for long-term tracking and analysis

### 2. Personalized Learning

- Auto-generates exercises based on user's actual mistakes
- Focuses practice on weak areas (grammar rules users struggle with most)
- Multiple exercise types: fill-in-blank, multiple choice, corrections

### 3. Progress Tracking

- Visual dashboards showing improvement over time
- Identifies weak areas and strengths
- Tracks practice streaks and milestones
- Provides personalized improvement suggestions

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: Blade templates, Tailwind CSS v4, Vite 7
- **Database**: PostgreSQL 18
- **Cache/Queue/Sessions**: Redis
- **API Integration**: LanguageTool (self-hosted or public)
- **Containerization**: Docker Compose (Laravel Sail)
- **Testing**: PHPUnit 11, Mockery

## How It Works

1. User writes text in the editor
2. System checks for errors using LanguageTool
3. Errors are stored and categorized by type (grammar, spelling, etc.)
4. System generates practice exercises from user's mistakes
5. User completes exercises, system tracks accuracy
6. Dashboard shows progress, weak areas, and suggestions

## Perfect For

- Language learners improving writing skills
- Teachers tracking student progress
- Writers wanting to improve quality
- Anyone wanting systematic language improvement

## Quick Start

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 16+ and npm
- MySQL or PostgreSQL
- LanguageTool server (self-hosted or use public API)

### Installation

1. **Install Dependencies**

```bash
composer install
npm install
```

2. **Configure Environment**

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set:

```env
DB_DATABASE=language_learning
DB_USERNAME=your_username
DB_PASSWORD=your_password

LANGUAGETOOL_API_URL=http://localhost:8010/v2/check
```

3. **Setup Database**

```bash
php artisan migrate
php artisan db:seed --class=ErrorCategorySeeder
```

4. **Build Assets and Run**

```bash
npm run dev
php artisan serve
```

Visit `http://localhost:8000`

### LanguageTool Setup

**Option 1: Docker (Easiest)**

```bash
docker run -d -p 8010:8010 erikvl87/languagetool:latest
```

**Option 2: Download**

```bash
wget https://languagetool.org/download/LanguageTool-stable.zip
unzip LanguageTool-stable.zip
cd LanguageTool-*/
java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8010
```

## Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get started in 5 minutes
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Project Structure](docs/STRUCTURE.md)** - Architecture overview

## API Endpoints

### Text Analysis

- `POST /api/v1/check-text` - Quick grammar check
- `POST /api/v1/text/analyze` - Analyze and store errors
- `GET /api/v1/text/errors` - Get error history

### Exercises

- `GET /api/v1/exercises` - Get personalized exercises
- `POST /api/v1/exercises/{id}/submit` - Submit answer
- `POST /api/v1/exercises/generate` - Generate new exercises

### Analytics

- `GET /api/v1/analytics/dashboard` - Progress dashboard
- `GET /api/v1/analytics/weak-areas` - Identify weak areas
- `GET /api/v1/analytics/suggestions` - Improvement tips

## Project Structure

```
├── app/
│   ├── Http/Controllers/     # API Controllers
│   ├── Models/               # Eloquent Models
│   └── Services/             # Business Logic
│       ├── LanguageToolService.php
│       ├── ErrorAnalysisService.php
│       ├── ExerciseGeneratorService.php
│       └── ProgressTrackerService.php
├── database/
│   ├── migrations/           # Database schema
│   └── seeders/              # Sample data
├── resources/
│   └── js/components/        # Vue.js components
└── routes/
    ├── api.php               # API routes
    └── web.php               # Web routes
```

## License

MIT License

## Support

For detailed documentation, see the `docs/` folder.

## Installation

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js & npm
- MySQL or PostgreSQL
- LanguageTool server (self-hosted or use public API)

### Setup Steps

1. **Clone and Install Dependencies**

```bash
composer install
npm install
```

2. **Environment Configuration**

```bash
cp .env.example .env
php artisan key:generate
```

3. **Configure Database**
   Edit `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=language_learning
DB_USERNAME=root
DB_PASSWORD=
```

4. **Configure LanguageTool**
   Edit `.env` file:

```env
LANGUAGETOOL_API_URL=http://localhost:8010/v2/check
LANGUAGETOOL_ENABLED=true
LANGUAGETOOL_CACHE_ENABLED=true
LANGUAGETOOL_CACHE_TTL=3600
```

5. **Run Migrations**

```bash
php artisan migrate
```

6. **Seed Database (Optional)**

```bash
php artisan db:seed
```

7. **Build Assets**

```bash
npm run dev
# or for production
npm run build
```

8. **Start Development Server**

```bash
php artisan serve
```

## LanguageTool Setup

### Option 1: Self-Hosted (Recommended)

1. Download LanguageTool standalone:

```bash
wget https://languagetool.org/download/LanguageTool-stable.zip
unzip LanguageTool-stable.zip
```

2. Start the server:

```bash
cd LanguageTool-*/
java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8010 --allow-origin "*"
```

### Option 2: Public API

Use the public API (limited requests): `https://api.languagetool.org/v2/check`

## API Endpoints

### Text Analysis

- `POST /api/check-text` - Analyze text for errors
- `GET /api/user/errors` - Get user's error history
- `GET /api/user/statistics` - Get learning statistics

### Exercises

- `GET /api/exercises` - Get personalized exercises
- `POST /api/exercises/{id}/submit` - Submit exercise answer
- `GET /api/exercises/progress` - Get exercise completion stats

### Analytics

- `GET /api/analytics/errors` - Error distribution by category
- `GET /api/analytics/progress` - Progress over time
- `GET /api/analytics/weak-areas` - Identify skill gaps

## Project Structure

```
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── TextAnalysisController.php
│   │   │   ├── ExerciseController.php
│   │   │   ├── AnalyticsController.php
│   │   │   └── DashboardController.php
│   │   └── Requests/
│   │       ├── CheckTextRequest.php
│   │       └── SubmitExerciseRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── TextSubmission.php
│   │   ├── Error.php
│   │   ├── ErrorCategory.php
│   │   ├── Exercise.php
│   │   └── ExerciseAttempt.php
│   └── Services/
│       ├── LanguageToolService.php
│       ├── ErrorAnalysisService.php
│       ├── ExerciseGeneratorService.php
│       └── ProgressTrackerService.php
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── TextEditor.vue
│   │   │   ├── ErrorDisplay.vue
│   │   │   ├── ExerciseCard.vue
│   │   │   └── ProgressChart.vue
│   │   └── app.js
│   └── views/
└── routes/
    ├── web.php
    └── api.php
```

## Usage

### For Users

1. **Write & Check**: Type or paste text in the editor
2. **Review Errors**: See highlighted errors with explanations
3. **Practice**: Complete auto-generated exercises based on your mistakes
4. **Track Progress**: View your improvement over time

### For Developers

See `docs/API.md` for detailed API documentation.

## Contributing

Contributions are welcome! Please read `CONTRIBUTING.md` for details.

## License

MIT License - see `LICENSE` file for details.

## Support

For issues and questions, please open a GitHub issue.
