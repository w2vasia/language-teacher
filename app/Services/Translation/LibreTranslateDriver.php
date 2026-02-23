<?php

namespace App\Services\Translation;

use App\Contracts\TranslationDriver;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class LibreTranslateDriver implements TranslationDriver
{
    public function translate(string $text, string $from, string $to): string
    {
        $config = config('translation.drivers.libretranslate');

        $response = Http::timeout($config['timeout'])
            ->post($config['api_url'], [
                'q' => $text,
                'source' => $from,
                'target' => $to,
                'format' => 'text',
            ]);

        if ($response->failed()) {
            throw new RuntimeException('LibreTranslate request failed: '.$response->status());
        }

        return $response->json('translatedText', '');
    }
}
