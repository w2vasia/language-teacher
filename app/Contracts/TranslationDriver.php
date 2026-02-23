<?php

namespace App\Contracts;

interface TranslationDriver
{
    public function translate(string $text, string $from, string $to): string;
}
