<?php

namespace App\Services\Translation;

use App\Contracts\TranslationDriver;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class DeepLDriver implements TranslationDriver
{
    public function translate(string $text, string $from, string $to): string
    {
        $config = config('translation.drivers.deepl');

        if (empty($config['api_key'])) {
            throw new RuntimeException('DeepL API key is not configured.');
        }

        $response = Http::timeout($config['timeout'])
            ->withHeader('Authorization', 'DeepL-Auth-Key '.$config['api_key'])
            ->post($config['api_url'], [
                'text' => [$text],
                'source_lang' => strtoupper($from),
                'target_lang' => strtoupper($to),
            ]);

        if ($response->failed()) {
            throw new RuntimeException('DeepL request failed: '.$response->status());
        }

        return $response->json('translations.0.text', '');
    }
}
