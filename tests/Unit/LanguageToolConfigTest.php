<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class LanguageToolConfigTest extends TestCase
{
    public function test_config_has_required_keys(): void
    {
        $config = require __DIR__ . '/../../config/languagetool.php';
        $this->assertArrayHasKey('api_url', $config);
        $this->assertArrayHasKey('enabled', $config);
        $this->assertArrayHasKey('timeout', $config);
        $this->assertArrayHasKey('default_language', $config);
    }
}
