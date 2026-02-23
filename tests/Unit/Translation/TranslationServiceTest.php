<?php

namespace Tests\Unit\Translation;

use App\Contracts\TranslationDriver;
use App\Services\TranslationService;
use PHPUnit\Framework\TestCase;

class TranslationServiceTest extends TestCase
{
    public function test_translate_delegates_to_driver(): void
    {
        $driver = $this->createMock(TranslationDriver::class);
        $driver->expects($this->once())
            ->method('translate')
            ->with('Hello', 'en', 'ru')
            ->willReturn('Привет');

        $service = new TranslationService($driver);
        $result = $service->translate('Hello', 'en', 'ru');

        $this->assertSame('Привет', $result);
    }

    public function test_translate_passes_explicit_languages(): void
    {
        $driver = $this->createMock(TranslationDriver::class);
        $driver->expects($this->once())
            ->method('translate')
            ->with('Bonjour', 'fr', 'de')
            ->willReturn('Hallo');

        $service = new TranslationService($driver);
        $result = $service->translate('Bonjour', 'fr', 'de');

        $this->assertSame('Hallo', $result);
    }
}
