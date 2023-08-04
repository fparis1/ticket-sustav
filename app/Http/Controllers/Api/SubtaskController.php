<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subtask;
use App\Http\Requests\StoreSubtaskRequest;
use App\Http\Requests\UpdateSubtaskRequest;
use App\Http\Resources\SubtaskResource;

class SubtaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubtaskRequest $request)
    {
        $data = $request->validated();
        $subtask = Subtask::create($data);

        return response(new SubtaskResource($subtask) , 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($ticketId)
    {
        $subtasks = Subtask::where('ticket_id', $ticketId)->orderBy('id', 'asc')->get();

        if ($subtasks->isEmpty()) {
            return response()->json(['message' => 'No subtasks found for the given ticket_id'], 404);
        }
        return SubtaskResource::collection($subtasks);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubtaskRequest $request, Subtask $subtask)
    {
        $data = $request->validated();
        $subtask->update($data);

        return new SubtaskResource($subtask);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($ticketId)
    {
        $subtasks = Subtask::where('ticket_id', $ticketId)->get();

        if ($subtasks->isEmpty()) {
            return response()->json(['message' => 'No subtasks found for the given ticket_id'], 204);
        }

        foreach ($subtasks as $subtask) {
            $subtask->delete();
        }

        return response()->json(['message' => 'Subtasks deleted successfully'], 200);
    }
}
