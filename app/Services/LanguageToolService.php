<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class LanguageToolService
{
    public function check(string $text, ?string $language = null): array
    {
        if (!config('languagetool.enabled')) {
            throw new RuntimeException('LanguageTool is disabled.');
        }

        $response = Http::timeout(config('languagetool.timeout'))
            ->asForm()
            ->post(config('languagetool.api_url'), [
                'text' => $text,
                'language' => $language ?? config('languagetool.default_language'),
            ]);

        if ($response->failed()) {
            throw new RuntimeException('LanguageTool request failed: ' . $response->status());
        }

        return $response->json('matches', []);
    }
}
