<?php

namespace Tests\Unit\Models;

use App\Models\ErrorCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorCategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_error_category(): void
    {
        $category = ErrorCategory::create([
            'name' => 'Grammar',
            'slug' => 'grammar',
            'description' => 'Grammar errors',
        ]);

        $this->assertDatabaseHas('error_categories', ['slug' => 'grammar']);
        $this->assertEquals('Grammar', $category->name);
    }

    public function test_slug_is_unique(): void
    {
        ErrorCategory::create(['name' => 'Grammar', 'slug' => 'grammar']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        ErrorCategory::create(['name' => 'Grammar 2', 'slug' => 'grammar']);
    }

    public function test_seeder_creates_all_categories(): void
    {
        $this->seed(\Database\Seeders\ErrorCategorySeeder::class);

        $this->assertEquals(7, ErrorCategory::count());
        $this->assertDatabaseHas('error_categories', ['slug' => 'grammar']);
        $this->assertDatabaseHas('error_categories', ['slug' => 'spelling']);
        $this->assertDatabaseHas('error_categories', ['slug' => 'typography']);
        $this->assertDatabaseHas('error_categories', ['slug' => 'style']);
        $this->assertDatabaseHas('error_categories', ['slug' => 'capitalization']);
        $this->assertDatabaseHas('error_categories', ['slug' => 'punctuation']);
        $this->assertDatabaseHas('error_categories', ['slug' => 'other']);
    }
}
