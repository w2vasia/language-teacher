<?php

namespace Database\Seeders;

use App\Models\ErrorCategory;
use Illuminate\Database\Seeder;

class ErrorCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Grammar', 'slug' => 'grammar', 'description' => 'Grammar errors'],
            ['name' => 'Spelling', 'slug' => 'spelling', 'description' => 'Spelling mistakes'],
            ['name' => 'Typography', 'slug' => 'typography', 'description' => 'Typographical errors'],
            ['name' => 'Style', 'slug' => 'style', 'description' => 'Style suggestions'],
            ['name' => 'Capitalization', 'slug' => 'capitalization', 'description' => 'Capitalization issues'],
            ['name' => 'Punctuation', 'slug' => 'punctuation', 'description' => 'Punctuation errors'],
            ['name' => 'Other', 'slug' => 'other', 'description' => 'Other issues'],
        ];

        foreach ($categories as $category) {
            ErrorCategory::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
