<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ErrorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'context' => $this->context,
            'offset' => $this->offset,
            'length' => $this->length,
            'replacement_suggestions' => $this->replacement_suggestions,
            'rule_id' => $this->rule_id,
            'rule_description' => $this->rule_description,
            'category' => $this->whenLoaded('errorCategory', fn () => [
                'name' => $this->errorCategory->name,
                'slug' => $this->errorCategory->slug,
            ]),
        ];
    }
}
