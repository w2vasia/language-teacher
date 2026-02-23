<?php

return [
    'driver' => env('TRANSLATION_DRIVER', 'libretranslate'),

    'source_language' => env('TRANSLATION_SOURCE_LANGUAGE', 'en'),
    'target_language' => env('TRANSLATION_TARGET_LANGUAGE', 'ru'),

    'drivers' => [
        'libretranslate' => [
            'api_url' => env('LIBRETRANSLATE_API_URL', 'http://libretranslate:5000/translate'),
            'timeout' => env('LIBRETRANSLATE_TIMEOUT', 15),
        ],
        'deepl' => [
            'api_url' => env('DEEPL_API_URL', 'https://api-free.deepl.com/v2/translate'),
            'api_key' => env('DEEPL_API_KEY'),
            'timeout' => env('DEEPL_TIMEOUT', 15),
        ],
    ],
];
