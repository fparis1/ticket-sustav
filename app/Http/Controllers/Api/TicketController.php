<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $sortBy = $request->query('sort_by', 'id');
        $sortDirection = $request->query('sort_dir', 'asc');

        $ticketsQuery = Ticket::query();

        if ($user->role === 'tech') {
            $technicianId = $user->id;

            $ticketsQuery->where(function ($query) use ($technicianId) {
                $query->where('technician_id', $technicianId)
                    ->orWhereRaw("FIND_IN_SET(?, technician_id)", [$technicianId])
                    ->orWhere('status', 'open');
            });
        }

        if ($sortBy === 'name') {
            $ticketsQuery->orderBy('name', $sortDirection);
        } elseif ($sortBy === 'description') {
            $ticketsQuery->orderBy('description', $sortDirection);
        } elseif ($sortBy === 'status') {
            $ticketsQuery->orderBy('status', $sortDirection);
        } elseif ($sortBy === 'technician_id') {
            $ticketsQuery->orderBy('technician_id', $sortDirection);
        } else {
            $ticketsQuery->orderBy($sortBy, $sortDirection);
        }

        return TicketResource::collection($ticketsQuery->paginate(5));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTicketRequest $request)
    {
       $technicianIds = implode(',', $request->input('technician_id', []));

       $ticket = new Ticket([
           'name' => $request->input('name'),
           'description' => $request->input('description'),
           'status' => $request->input('status'),
           'technician_id' => $technicianIds,
           'client_id' => $request->input('client_id'),
       ]);

       $ticket->save();

       return new TicketResource($ticket);
    }

    /**
     * Display the specified resource.
     */
    public function show(Ticket $ticket)
    {
        return new TicketResource($ticket);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        $data = $request->validated();

        if (isset($data['technician_id']) && is_array($data['technician_id'])) {
            $data['technician_id'] = implode(',', $data['technician_id']);
        }

        $ticket->update($data);

        return new TicketResource($ticket);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return response("", 204);
    }
}
