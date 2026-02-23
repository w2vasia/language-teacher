<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WritingPrompt extends Model
{
    /** @use HasFactory<\Database\Factories\WritingPromptFactory> */
    use HasFactory;

    protected $fillable = ['title', 'body', 'category', 'difficulty'];

    public function textSubmissions(): HasMany
    {
        return $this->hasMany(TextSubmission::class);
    }
}
