<?php

namespace App\Services;

use App\Contracts\TranslationDriver;

class TranslationService
{
    public function __construct(private TranslationDriver $driver) {}

    public function translate(string $text, ?string $from = null, ?string $to = null): string
    {
        return $this->driver->translate(
            $text,
            $from ?? config('translation.source_language'),
            $to ?? config('translation.target_language'),
        );
    }
}
