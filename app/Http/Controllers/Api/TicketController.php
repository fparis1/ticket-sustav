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

    $ticketsQuery = Ticket::query()->orderBy($sortBy, $sortDirection);

    // Check if the user's role is 'tech', then filter tickets based on technician_id
    if ($user->role === 'tech') {
        $ticketsQuery->where('technician_id', $user->id)->orWhere('technician_id', '-');;
    }

    if ($sortBy === 'name') {
        $ticketsQuery->orderBy('name', $sortDirection);
    } elseif ($sortBy === 'description') {
        $ticketsQuery->orderBy('description', $sortDirection);
    } elseif ($sortBy === 'status') {
        $ticketsQuery->orderBy('status', $sortDirection);
    } elseif ($sortBy === 'technician_id') {
        $ticketsQuery->orderBy('technician_id', $sortDirection);
    }

    return TicketResource::collection($ticketsQuery->paginate(5));
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTicketRequest $request)
    {
        $data = $request->validated();
        $user = Ticket::create($data);

        return response(new TicketResource($user) , 201);
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
