<?php

namespace App\Providers;

use App\Contracts\TranslationDriver;
use App\Services\Translation\DeepLDriver;
use App\Services\Translation\LibreTranslateDriver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TranslationDriver::class, function () {
            return match (config('translation.driver')) {
                'libretranslate' => new LibreTranslateDriver,
                'deepl' => new DeepLDriver,
                default => throw new RuntimeException('Unknown translation driver: '.config('translation.driver')),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
