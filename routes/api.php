<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\TextAnalysisController;
use App\Http\Controllers\Api\V1\TextCheckController;
use App\Http\Controllers\Api\V1\WritingPromptController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('/check-text', TextCheckController::class);
    Route::post('/text/analyze', [TextAnalysisController::class, 'analyze']);
    Route::get('/text/errors', [TextAnalysisController::class, 'errors']);
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/analytics/weak-areas', [AnalyticsController::class, 'weakAreas']);
    Route::get('/writing-prompts', [WritingPromptController::class, 'index']);
});
