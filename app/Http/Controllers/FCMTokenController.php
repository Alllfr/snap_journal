<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class FCMTokenController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'token' => 'required|string',
        ]);

        $user = User::find($request->user_id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $user->fcm_token = $request->token;
        $user->save();

        return response()->json([
            'message' => 'FCM token berhasil disimpan',
            'user_id' => $user->id
        ]);
    }
}
