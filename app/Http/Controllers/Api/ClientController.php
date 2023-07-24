<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $sortBy = $request->query('sort_by', 'id'); 
        $sortDirection = $request->query('sort_dir', 'asc');

        $clientsQuery = Client::query()->orderBy($sortBy, $sortDirection);

         if ($sortBy === 'name') {
             $clientsQuery->orderBy('name', $sortDirection);
         } elseif ($sortBy === 'email') {
             $clientsQuery->orderBy('email', $sortDirection);
         } elseif ($sortBy === 'phone') {
             $clientsQuery->orderBy('phone', $sortDirection);
         }

        return ClientResource::collection($clientsQuery->paginate(5));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
        $data = $request->validated();
        $client = Client::create($data);

        return response(new ClientResource($client) , 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        return new ClientResource($client);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        $data = $request->validated();
        $client->update($data);

        return new ClientResource($client);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return response("", 204);
    }
}
