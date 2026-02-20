<?php

namespace Tests\Unit\Services;

use App\Services\LanguageToolService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LanguageToolServiceTest extends TestCase
{
    private LanguageToolService $service;

    protected function setUp(): void
    {
        parent::setUp();
        config(['languagetool.enabled' => true]);
        config(['languagetool.api_url' => 'http://languagetool:8010/v2/check']);
        config(['languagetool.timeout' => 10]);
        config(['languagetool.default_language' => 'en-US']);
        $this->service = new LanguageToolService();
    }

    public function test_returns_matches_from_response(): void
    {
        Http::fake([
            'languagetool:8010/*' => Http::response([
                'matches' => [
                    ['message' => 'Possible spelling mistake', 'rule' => ['id' => 'MORFOLOGIK_RULE_EN_US']],
                ],
            ]),
        ]);

        $result = $this->service->check('Ths is a tset.');

        $this->assertCount(1, $result);
        $this->assertEquals('Possible spelling mistake', $result[0]['message']);
    }

    public function test_returns_empty_array_when_no_errors(): void
    {
        Http::fake([
            'languagetool:8010/*' => Http::response(['matches' => []]),
        ]);

        $result = $this->service->check('This is correct.');

        $this->assertEmpty($result);
    }

    public function test_throws_when_disabled(): void
    {
        config(['languagetool.enabled' => false]);
        $service = new LanguageToolService();

        $this->expectException(\RuntimeException::class);
        $service->check('test');
    }

    public function test_accepts_custom_language(): void
    {
        Http::fake([
            'languagetool:8010/*' => Http::response(['matches' => []]),
        ]);

        $this->service->check('Bonjour', 'fr');

        Http::assertSent(function ($request) {
            return $request['language'] === 'fr';
        });
    }

    public function test_throws_on_http_failure(): void
    {
        Http::fake([
            'languagetool:8010/*' => Http::response('Server Error', 500),
        ]);

        $this->expectException(\RuntimeException::class);
        $this->service->check('test');
    }
}
