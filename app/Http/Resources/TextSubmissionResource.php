<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TextSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'original_text' => $this->original_text,
            'translated_text' => $this->translated_text,
            'word_count' => $this->word_count,
            'writing_prompt_id' => $this->writing_prompt_id,
            'score' => $this->when($this->relationLoaded('errors'), function () {
                if ($this->word_count === 0) {
                    return 0;
                }
                $errorCount = $this->errors->count();

                return max(0, round(100 - ($errorCount / $this->word_count * 500)));
            }),
            'checked_at' => $this->checked_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'errors' => ErrorResource::collection($this->whenLoaded('errors')),
        ];
    }
}
