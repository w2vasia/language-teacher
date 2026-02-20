<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Error extends Model
{
    use HasFactory;

    protected $fillable = [
        'text_submission_id',
        'error_category_id',
        'message',
        'context',
        'offset',
        'length',
        'replacement_suggestions',
        'rule_id',
        'rule_description',
    ];

    protected $casts = [
        'replacement_suggestions' => 'array',
    ];

    public function textSubmission(): BelongsTo
    {
        return $this->belongsTo(TextSubmission::class);
    }

    public function errorCategory(): BelongsTo
    {
        return $this->belongsTo(ErrorCategory::class);
    }
}
