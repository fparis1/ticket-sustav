<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Resources\CommentResource;

class CommentController extends Controller
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
    public function store(StoreCommentRequest $request)
    {
        $data = $request->validated();
        $comment = COmment::create($data);

        return response(new CommentResource($comment) , 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($ticketId)
    {
        $comments = Comment::where('ticket_id', $ticketId)->orderBy('id', 'asc')->get();

        if ($comments->isEmpty()) {
            return response()->json(['message' => 'No comments found for the given ticket_id'], 404);
        }

        return CommentResource::collection($comments);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommentRequest $request, Comment $comment)
    {
        $data = $request->validated();
        $comment->update($data);

        return new CommentResource($comment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {
        $comment->delete();

        return response("", 204);
    }
}
