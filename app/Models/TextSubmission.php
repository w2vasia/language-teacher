<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TextSubmission extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'original_text', 'translated_text', 'word_count', 'checked_at', 'writing_prompt_id'];

    protected $casts = [
        'checked_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (TextSubmission $submission) {
            if (is_null($submission->word_count)) {
                $submission->word_count = preg_match_all('/\pL[\pL\'-]*/u', $submission->original_text);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function writingPrompt(): BelongsTo
    {
        return $this->belongsTo(WritingPrompt::class);
    }

    public function errors(): HasMany
    {
        return $this->hasMany(Error::class);
    }
}
