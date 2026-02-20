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
            'word_count' => $this->word_count,
            'checked_at' => $this->checked_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'errors' => ErrorResource::collection($this->whenLoaded('errors')),
        ];
    }
}
