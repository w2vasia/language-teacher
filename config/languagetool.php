<?php

return [
    'api_url' => env('LANGUAGETOOL_API_URL', 'http://languagetool:8010/v2/check'),
    'enabled' => env('LANGUAGETOOL_ENABLED', true),
    'timeout' => env('LANGUAGETOOL_TIMEOUT', 10),
    'default_language' => env('LANGUAGETOOL_DEFAULT_LANGUAGE', 'en-US'),
];
