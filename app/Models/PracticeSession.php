<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PracticeSession extends Model
{
    /** @use HasFactory<\Database\Factories\PracticeSessionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'error_category_id',
        'difficulty',
        'total_exercises',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function errorCategory(): BelongsTo
    {
        return $this->belongsTo(ErrorCategory::class);
    }

    public function errors(): HasMany
    {
        return $this->hasMany(Error::class);
    }
}
