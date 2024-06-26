<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{

    public static $wrap = false;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {

        $technicianIds = explode(',', $this->technician_id);
        $technicianIds = array_map('intval', $technicianIds);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'client_id' => $this->client_id,
            'technician_id' => $technicianIds,
        ];
    }
}
