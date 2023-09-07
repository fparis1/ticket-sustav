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
        $comment = new Comment([
            'description' => $request->input('description'),
            'ticket_id' => $request->input('ticket_id'),
            'user_id' => $request->input('user_id'),
        ]);

        $comment->save();

        return response(null, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($ticketId)
    {
        $comments = Comment::where('ticket_id', $ticketId)->orderBy('created_at', 'desc')->get();

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
    public function destroy($ticketId)
    {
        $comments = Comment::where('ticket_id', $ticketId)->get();

        if ($comments->isEmpty()) {
            return response()->json(['message' => 'No comments found for the given ticket_id'], 204);
        }

        foreach ($comments as $comment) {
            $comment->delete();
        }

        return response()->json(['message' => 'Comments deleted successfully'], 200);
    }
}
