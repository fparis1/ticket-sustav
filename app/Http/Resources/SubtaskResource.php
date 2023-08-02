<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubtaskResource extends JsonResource
{

    public static $wrap = false;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'description' => $this->description,
            'technician_id' => $this->technician_id,
            'status' => $this->status,
        ];
    }
}
