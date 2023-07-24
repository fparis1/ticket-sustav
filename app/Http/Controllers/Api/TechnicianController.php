<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class TechnicianController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $sortBy = $request->query('sort_by', 'id'); 
        $sortDirection = $request->query('sort_dir', 'asc');

        $techniciansQuery = User::where('role', 'tech')->orderBy($sortBy, $sortDirection);

        if ($sortBy === 'name') {
            $techniciansQuery->orderBy('name', $sortDirection);
        } elseif ($sortBy === 'email') {
            $techniciansQuery->orderBy('email', $sortDirection);
        }

        return UserResource::collection($techniciansQuery->paginate(5));
    }

}